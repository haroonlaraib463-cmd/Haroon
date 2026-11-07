import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing large JSON payloads (receipt images can be base64)
app.use(express.json({ limit: '25mb' }));

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory encrypted backup store (keyed by userId/hash)
const encryptedCloudBackups = new Map<string, { payload: string; updatedAt: string; version: number }>();

// API: Automated Receipt Scanning with Gemini Vision
app.post('/api/scan-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data in request body' });
    }

    if (!aiClient) {
      // Graceful fallback response when GEMINI_API_KEY is not configured yet
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment',
        fallbackNeeded: true,
      });
    }

    // Strip data URL header if included
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const cleanMime = mimeType || 'image/jpeg';

    const prompt = `Analyze this purchase receipt or invoice. Extract exact financial details accurately.
Determine:
1. Merchant/Store name
2. Date of transaction in YYYY-MM-DD format (if year is missing or ambiguous, assume recent year 2026/2025)
3. Total transaction amount as a pure number
4. Tax amount if present as a pure number (or 0)
5. 3-letter currency code (e.g. USD, EUR, GBP, JPY, CAD, AUD, etc.)
6. Best category from: Dining, Groceries, Transportation, Utilities, Technology, Entertainment, Shopping, Health, Travel, Subscriptions, Office, Miscellaneous
7. Payment method used (e.g. Visa 4242, Apple Pay, Cash, Mastercard, Debit, Unknown)
8. Array of itemized line items with name, quantity, and item price.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: cleanMime,
            data: cleanBase64,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING, description: 'Business or merchant name' },
            date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' },
            totalAmount: { type: Type.NUMBER, description: 'Final total amount paid' },
            taxAmount: { type: Type.NUMBER, description: 'Sales tax or VAT amount' },
            currency: { type: Type.STRING, description: '3-letter currency ISO code' },
            category: { type: Type.STRING, description: 'Best matching spending category' },
            paymentMethod: { type: Type.STRING, description: 'Payment method or card used' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                },
              },
            },
            notes: { type: Type.STRING, description: 'Brief summary or receipt invoice ID' },
          },
          required: ['merchant', 'totalAmount', 'date', 'category'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Empty response received from AI model');
    }

    const parsedData = JSON.parse(textOutput);
    return res.json({
      success: true,
      data: parsedData,
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error processing receipt scan:', error);
    return res.status(500).json({
      error: error.message || 'Failed to scan receipt',
      fallbackNeeded: true,
    });
  }
});

// API: Secure Cloud Backup Save (Encrypted blob)
app.post('/api/backup/save', (req, res) => {
  try {
    const { userId, encryptedPayload, version } = req.body;
    if (!userId || !encryptedPayload) {
      return res.status(400).json({ error: 'userId and encryptedPayload are required' });
    }

    encryptedCloudBackups.set(userId, {
      payload: encryptedPayload,
      updatedAt: new Date().toISOString(),
      version: version || 1,
    });

    return res.json({
      success: true,
      updatedAt: new Date().toISOString(),
      message: 'Encrypted backup synchronized securely to cloud.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Backup save failed' });
  }
});

// API: Secure Cloud Backup Retrieve
app.get('/api/backup/load/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const backup = encryptedCloudBackups.get(userId);
    if (!backup) {
      return res.status(404).json({ error: 'No cloud backup found for this account' });
    }

    return res.json({
      success: true,
      payload: backup.payload,
      updatedAt: backup.updatedAt,
      version: backup.version,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Backup retrieval failed' });
  }
});

// Serve Vite in development or static build in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
