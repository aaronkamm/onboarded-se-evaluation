import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { handleWebhook } from './src/handlers/webhookHandler.js';

const REQUIRED_ENV_VARS = [
  'ONBOARDED_TOKEN',
  'ONBOARDED_WEBHOOK_TOKEN',
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID',
  'AIRTABLE_TABLE_NAME'
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(', ')}`
  );
  process.exit(1);
}

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Onboarded → Airtable compliance tracker' });
});

app.post('/webhook', handleWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
