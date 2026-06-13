# SMS Node App

> Send SMS via Twilio API with a simple web form and Socket.io updates.
<img width="2240" height="1170" alt="image" src="https://github.com/user-attachments/assets/0e98221f-641e-4a5b-982b-c2c74fa29e51" />


## Purpose

Send SMS via Twilio with a simple web form and real-time delivery status.

## Tech Stack

- Node.js
- Express
- EJS
- Twilio
- Socket.io

## How to Run Locally

```bash
npm install
cp .env.example .env   # then set DEMO_MODE=false and Twilio keys
npm run demo           # simulated SMS (no account needed)
npm start              # live SMS (requires Twilio env vars below)
```

## Free SMS with Twilio (simplest option)

Twilio gives a **free trial** with about **$15 credit** — enough for hundreds of test SMS.

### Setup (5 minutes)

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio) (free).
2. In the Twilio Console, copy:
   - **Account SID**
   - **Auth Token**
3. Get a **Trial phone number** (Console → Phone Numbers → Manage → Buy a number — free on trial).
4. **Verify your phone** (Console → Phone Numbers → Verified Caller IDs) — trial accounts can only send to verified numbers.

### Render / environment variables

| Variable | Example | Required |
|----------|---------|----------|
| `DEMO_MODE` | `false` | Yes for real SMS |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxx` | Yes |
| `TWILIO_AUTH_TOKEN` | `your_auth_token` | Yes |
| `TWILIO_FROM_NUMBER` | `+15017122661` | Yes — your Twilio number |

### Render commands

| Setting | Value |
|--------|--------|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

> **Note:** On the free trial, SMS only goes to numbers you verify in Twilio. After upgrading, you can send to any number.

## Live Demo

https://textsmsnodeapp.onrender.com

> GitHub Pages hosts a static UI only. Deploy on Render for live SMS.

---

Part of [Old Basic Projects](../README.md) portfolio.
