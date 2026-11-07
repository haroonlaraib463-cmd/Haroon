/**
 * Biometric authentication service using Web Authentication API (WebAuthn / Passkeys)
 * with graceful fallback for iframe sandboxes and non-hardware environments.
 */

export interface BiometricAuthResult {
  success: boolean;
  type: 'hardware_biometrics' | 'passkey_pin' | 'fallback_pin';
  error?: string;
}

/**
 * Checks if the current browser environment supports WebAuthn platform authenticators
 */
export async function isPlatformBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch (err) {
    console.warn('WebAuthn check failed:', err);
  }
  return false;
}

/**
 * Requests biometric verification via WebAuthn or simulated secure passkey prompt
 */
export async function authenticateWithBiometrics(username: string = 'User'): Promise<BiometricAuthResult> {
  try {
    if (window.PublicKeyCredential) {
      // Challenge array
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Attempt platform credential verification
      try {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'preferred',
          },
        });
        if (credential) {
          return { success: true, type: 'hardware_biometrics' };
        }
      } catch (innerError) {
        // Platform biometrics might be cancelled by user or restricted in iframe
        console.log('Native WebAuthn prompt completed/skipped, fallback to biometric PIN prompt.');
      }
    }
  } catch (e) {
    console.warn('Biometric challenge failed, fallback available:', e);
  }

  return { success: false, type: 'passkey_pin', error: 'Hardware biometrics prompt unhandled' };
}
