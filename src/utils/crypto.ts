/**
 * High-security client-side encryption using native Web Cryptography API (AES-GCM 256-bit).
 * Encrypts sensitive personal financial notes and cloud backup snapshots.
 */

const SALT = new TextEncoder().encode('aether-financial-vault-salt-v1');

/**
 * Derives a CryptoKey from a user passphrase using PBKDF2
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plain text using AES-GCM 256-bit with random 12-byte IV.
 * Returns base64 encoded string: iv:ciphertext
 */
export async function encryptSensitiveData(plainText: string, passphrase: string = 'aether-secure-default-key'): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await deriveKey(passphrase);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(plainText);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedData
    );

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const cipherBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    return `${ivBase64}:${cipherBase64}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return plainText;
  }
}

/**
 * Decrypts AES-GCM ciphertext using the derived key.
 */
export async function decryptSensitiveData(encryptedData: string, passphrase: string = 'aether-secure-default-key'): Promise<string> {
  if (!encryptedData || !encryptedData.includes(':')) return encryptedData;
  try {
    const [ivBase64, cipherBase64] = encryptedData.split(':');
    const iv = new Uint8Array(atob(ivBase64).split('').map((c) => c.charCodeAt(0)));
    const cipherBytes = new Uint8Array(atob(cipherBase64).split('').map((c) => c.charCodeAt(0)));

    const key = await deriveKey(passphrase);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.warn('Decryption failed, returning obscured text:', error);
    return '••• [Encrypted Financial Vault] •••';
  }
}

/**
 * Generates a SHA-256 hash of a string (e.g. for credential checks or payload signatures)
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
