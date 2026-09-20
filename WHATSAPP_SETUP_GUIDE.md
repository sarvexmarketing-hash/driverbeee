# DriverBee — WhatsApp Business Cloud API Setup & Operations Guide

This guide details how to configure and operate the official Meta WhatsApp Business Cloud API for the DriverBee booking system.

---

## 1. Meta Developer Account Setup
1. Go to [developers.facebook.com](https://developers.facebook.com).
2. Log in with your Facebook account and complete business developer registration if not already done.
3. Verify your email and accept the Developer Platform Terms.

---

## 2. Create the Meta App
1. Go to **My Apps** → **Create App**.
2. Select **Other** as the use case → Click **Next**.
3. Select **Business** as the app type.
4. Enter an **App name** (e.g. `DriverBee Dispatch System`) and your business contact email.
5. Link your **Meta Business Account** (DriverBee).
6. Click **Create app**.

---

## 3. Configure WhatsApp Business Platform
1. On your App Dashboard, scroll down to **Add products to your app**.
2. Find **WhatsApp** and click **Set up**.
3. You will be redirected to the **API Setup** page under WhatsApp in the left navigation.

---

## 4. Obtain Credentials
On the **WhatsApp > API Setup** screen, locate:

### A. Phone Number ID & WhatsApp Business Account ID
- Under **Send and receive messages**, note your **Phone Number ID** (e.g. `104928172635419`).
- Note your **WhatsApp Business Account ID** (WABA ID).

### B. Permanent System User Access Token
> [!IMPORTANT]
> The temporary 24-hour token on the API Setup page is only for quick testing. For production, generate a permanent System User Token:
1. Open [business.facebook.com/settings](https://business.facebook.com/settings).
2. Go to **Users > System Users** in the left sidebar.
3. Click **Add** → Name: `DriverBee Dispatch Bot`, Role: **Admin System User**.
4. Click **Add Assets** → Assign your **WhatsApp Business Account** with full control (`Manage WhatsApp Business Account`).
5. Click **Generate New Token**:
   - Select your App.
   - Set Token Expiration: **Never**.
   - Select Permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
6. Copy the generated token. This is your `WHATSAPP_ACCESS_TOKEN`.

### C. App Secret
1. In Meta App Dashboard, go to **App settings > Basic**.
2. Click **Show** next to **App secret**.
3. Copy this value as `WHATSAPP_APP_SECRET`.

---

## 5. Configure WhatsApp Business Template
Meta requires proactive notifications (outside the 24-hour customer care window) to use an approved message template.

1. In the Meta Developer Dashboard, navigate to **WhatsApp > Message Templates** (or [business.facebook.com/wa/manage/templates](https://business.facebook.com/wa/manage/templates)).
2. Click **Create template**:
   - **Category**: `Utility`
   - **Name**: `new_driver_booking`
   - **Language**: `English (US)` (`en_US`)
3. **Template Body**:
```text
🚗 New DriverBee Booking

Booking ID: {{1}}
Customer: {{2}}
Phone: {{3}}
Pickup: {{4}}
Drop: {{5}}
Date: {{6}}
Time: {{7}}
Vehicle: {{8}}
Amount: ₹{{9}}

Status: Pending
```
4. **Sample Values**:
   - `{{1}}`: `DB1024`
   - `{{2}}`: `Rahul Kumar`
   - `{{3}}`: `+91 98450 12345`
   - `{{4}}`: `Hanamkonda`
   - `{{5}}`: `Kazipet`
   - `{{6}}`: `21 September 2026`
   - `{{7}}`: `10:30 AM`
   - `{{8}}`: `Hyundai Creta`
   - `{{9}}`: `850`

5. **Buttons**:
   - Choose **Quick reply** (or Custom):
     - Button 1: Text: `Accept`
     - Button 2: Text: `Reject`
6. Click **Submit for Review**. Templates are usually approved within minutes.

---

## 6. Configure the Webhook
1. In the Meta Developer Dashboard, go to **WhatsApp > Configuration**.
2. In the **Webhook** section, click **Edit**:
   - **Callback URL**: `https://<YOUR_DOMAIN>/webhooks/whatsapp`
     *(For local testing with ngrok: `https://<ngrok-id>.ngrok-free.app/webhooks/whatsapp`)*
   - **Verify token**: A secret random string of your choice (e.g. `driverbee_wh_secret_2026`), matching `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
3. Click **Verify and save**. Meta will issue a `GET` request to your endpoint with `hub.challenge`. DriverBee will verify the token and return the challenge with HTTP 200.
4. Under **Webhook fields**, click **Manage** and subscribe to **`messages`**.

---

## 7. Authorized Admin WhatsApp Phone Numbers
WhatsApp actions (`ACCEPT` and `REJECT`) are strictly locked to authorized phone numbers.
Configure one or more admin numbers (comma-separated if multiple):
```bash
WHATSAPP_ADMIN_PHONE_NUMBER="917569402288,919876543210"
```
The system normalizes phone numbers automatically (+91, spaces, dashes, leading zeros are handled safely).

---

## 8. Environment Variables Reference

Add these variables in your deployment settings (e.g., **Vercel Dashboard > Settings > Environment Variables**):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `WHATSAPP_ENABLED` | Set `true` to enable live Meta API calls (`false` simulates locally) | `true` |
| `WHATSAPP_API_VERSION` | Meta Graph API Version | `v21.0` |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business Phone Number ID from Meta | `104928172635419` |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account ID (WABA ID) | `102938475612345` |
| `WHATSAPP_ACCESS_TOKEN` | Permanent System User Access Token | `EAA...` |
| `WHATSAPP_ADMIN_PHONE_NUMBER` | Authorized admin mobile numbers (comma-separated) | `917569402288` |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN`| Custom token for Meta webhook handshake verification | `driverbee_wh_secret_2026` |
| `WHATSAPP_APP_SECRET` | Meta App Secret for HMAC SHA-256 payload verification | `a1b2c3d4...` |
| `WHATSAPP_TEMPLATE_NAME` | Template name approved in Meta Business Manager | `new_driver_booking` |

> [!CAUTION]
> Never prefix WhatsApp tokens or secrets with `VITE_`. Variables prefixed with `VITE_` are bundled into frontend browser assets.

---

## 9. Database Migration
Apply the SQL migration to your Supabase project:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor > New Query**.
3. Copy and run the contents of `supabase/migrations/20260921_whatsapp_integration.sql`.
4. This creates the `whatsapp_notifications` tracking table and adds audit columns (`accepted_at`, `accepted_by`, `rejected_at`, `rejected_by`) to `bookings`.

---

## 10. Local Development & Testing
DriverBee works completely without WhatsApp credentials when `WHATSAPP_ENABLED=false`:
```bash
# Run the 20 automated tests
npm test

# Run local development server (includes WhatsApp Dev Webhook middleware on port 3000)
npm run dev
```

You can test webhook verification locally with curl:
```bash
curl "http://localhost:3000/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=driverbee_wh_secret_2026&hub.challenge=test_123"
```
Expected response: `test_123` with HTTP 200.

---

## 11. Common Errors & Troubleshooting

| Error | Cause | Resolution |
| :--- | :--- | :--- |
| `190: Invalid OAuth access token` | Temporary token expired or revoked | Generate a permanent System User Token as described in Section 4B. |
| `132001: Template does not exist` | Template name or language mismatch | Verify template is named `new_driver_booking` and language is `en_US`. The integration automatically falls back to Interactive Buttons. |
| `131030: Recipient phone number not in allowed list` | Meta Test Number sandbox restriction | In Development mode, Meta only sends messages to numbers added in the WhatsApp Sandbox Allowed List on the API Setup page. |
| `Verification failed: hub.verify_token mismatch` | Verify token in Meta does not match environment | Ensure `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in Vercel matches the token entered in Meta Webhook config. |
| `401: Invalid x-hub-signature-256` | App secret mismatch | Check `WHATSAPP_APP_SECRET` matches your Meta App Secret in App Settings > Basic. |

---

## 12. Credential Rotation & Security
1. To rotate `WHATSAPP_ACCESS_TOKEN`: Generate a new System User Token in Meta Business Manager, update the variable in Vercel, and only revoke the old token after confirming delivery.
2. To rotate `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: Update the value in Vercel and Meta Webhook Configuration simultaneously.
