# Onboarded → Airtable Compliance Tracker

A webhook-driven integration that syncs Onboarded task updates to an Airtable compliance tracker in real time. Every time a task status changes in Onboarded, the corresponding record in Airtable is automatically created or updated; this gives HR teams live visibility into onboarding progress without requiring Onboarded access.

---

## Prerequisites

- Node.js / Express
- An Onboarded account with API access
- An Airtable account (free tier is fine)
- A Railway account for deployment (free tier is fine)

---

## Project Structure

```
index.js                          # Express server entry point
src/
  handlers/
    webhookHandler.js             # Core webhook logic and record building
  services/
    onboarded.js                  # Onboarded API handlers
    airtableClient.js             # Airtable upsert logic
```

---

## Airtable Setup

1. Create a new base in Airtable
2. Create a table and note the table ID from the URL (e.g. `tblXXXXXXXXXXXXXX`)
3. Add the following fields:

| Field Name      | Type             |
| --------------- | ---------------- |
| Task ID         | Single line text |
| Task Name       | Single line text |
| Employee ID     | Single line text |
| Employee Name   | Single line text |
| Employee Email  | Email            |
| Employer ID     | Single line text |
| Employer Name   | Single line text |
| Status          | Single line text |
| Next Action     | Single line text |
| Completed At    | Single line text |
| Last Updated At | Single line text |
| Created At      | Single line text |

4. Go to **airtable.com/create/tokens** and create a personal access token with:
   - Scopes: `data.records:read` and `data.records:write`
   - Access: scoped to your specific base only

---

## Local Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```
ONBOARDED_TOKEN=your_onboarded_api_token
ONBOARDED_WEBHOOK_TOKEN=your_webhook_token
AIRTABLE_API_KEY=your_airtable_personal_access_token
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_ID=tblXXXXXXXXXXXXXX
```

3. Start the server:

```bash
npm start
```

4. Confirm it's running:

```bash
curl http://localhost:3000
```

You should see:

```json
{ "message": "Onboarded → Airtable compliance tracker" }
```

---

## Deployment (Railway)

1. Push the repo to GitHub
2. Go to **railway.app** → New Project → Deploy from GitHub repo
3. Select your repo — Railway will auto-detect Node.js and deploy
4. Go to your service → **Settings** → **Networking** → **Generate Domain** to get your public URL
5. Go to **Variables** and add all env vars from the `.env` file above

---

## Registering the Webhook in Onboarded

1. Go to your Onboarded dashboard → Webhooks → Create New Webhook
2. Set the URL to:

```
https://your-app.up.railway.app/webhook
```

3. Set the subscription to `task.updated`
4. Copy the token from the response and add it to Railway as `ONBOARDED_WEBHOOK_TOKEN`
5. Railway will redeploy automatically

---

## Testing

1. Go into your Onboarded account and assign a task to an employee
2. Open the onboarding link and progress through the form
3. Check Railway logs, you should see the webhook being received and processed
4. Check Airtable, a row should appear or update reflecting the current task state

---

## Environment Variables

| Variable                  | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `ONBOARDED_TOKEN`         | API token from Onboarded dashboard → Settings → API Tokens |
| `ONBOARDED_WEBHOOK_TOKEN` | Token returned when registering the webhook in Onboarded   |
| `AIRTABLE_API_KEY`        | Personal access token from airtable.com/create/tokens      |
| `AIRTABLE_BASE_ID`        | Base ID from your Airtable URL e.g. `appXXXXXXXXXXXXXX`    |
| `AIRTABLE_TABLE_ID`       | Table ID from your Airtable URL e.g. `tblXXXXXXXXXXXXXX`   |

---

## Notes

- The server returns `200 OK` for all webhook events, even ignored or failed ones, to prevent Onboarded from retrying unnecessarily
- Webhook signature verification via HMAC-SHA256 was identified but scoped out for this exercise — a production implementation would verify the `webhook-signature` header
- Airtable upserts are idempotent, so if a webhook is delivered again, it updates the existing row instead of creating a duplicate
