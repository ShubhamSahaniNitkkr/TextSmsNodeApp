const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const socketio = require("socket.io");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

function getCredentials() {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER
  };
}

function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

function normalizePhoneNumber(input, countryCode = "91") {
  let digits = String(input || "").replace(/\D/g, "");
  const cc = String(countryCode).replace(/\D/g, "");

  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith(cc) && digits.length >= cc.length + 7) {
    return digits;
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return cc + digits;
}

function toE164(digits) {
  const clean = String(digits || "").replace(/\D/g, "");
  return clean ? "+" + clean : null;
}

function formatFromNumber(number) {
  const value = String(number || "").trim();
  if (!value) return null;
  return value.startsWith("+") ? value : "+" + value.replace(/\D/g, "");
}

const creds = getCredentials();
let twilioClient = null;

if (!isDemoMode() && creds.accountSid && creds.authToken) {
  twilioClient = require("twilio")(creds.accountSid, creds.authToken);
}

const app = express();

app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getStatus() {
  const fromNumber = formatFromNumber(creds.fromNumber);
  return {
    demoMode: isDemoMode(),
    twilioConfigured: !!twilioClient,
    senderConfigured: !!fromNumber,
    readyToSend: !isDemoMode() && !!twilioClient && !!fromNumber,
    provider: "twilio"
  };
}

app.get("/api/status", (req, res) => {
  res.json(getStatus());
});

app.get("/", (req, res) => {
  res.render("index", getStatus());
});

app.post("/", async (req, res) => {
  const countryCode = req.body.countryCode || "91";
  const number = normalizePhoneNumber(req.body.number, countryCode);
  const toNumber = toE164(number);
  const msg = String(req.body.msg || "").trim();
  const fromNumber = formatFromNumber(creds.fromNumber);

  if (!number || number.length < 10 || !toNumber) {
    return res.status(400).json({ error: "Enter a valid phone number." });
  }

  if (!msg) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  if (msg.length > 1600) {
    return res.status(400).json({ error: "Message is too long (max 1600 characters)." });
  }

  if (isDemoMode()) {
    const data = {
      id: "demo-" + Date.now(),
      number: toNumber,
      balance: "Free trial",
      charge: "$0.00",
      errortext: null,
      demoMode: true
    };
    io.emit("smsStatus", data);
    return res.json({ success: true, data });
  }

  if (!twilioClient) {
    return res.status(503).json({
      error: "Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
    });
  }

  if (!fromNumber) {
    return res.status(503).json({
      error: "Sender number missing. Set TWILIO_FROM_NUMBER (e.g. +15017122661)."
    });
  }

  try {
    const message = await twilioClient.messages.create({
      body: msg,
      from: fromNumber,
      to: toNumber
    });

    const data = {
      id: message.sid,
      number: message.to,
      balance: "Twilio trial",
      charge: message.price || "—",
      errortext: null,
      demoMode: false
    };
    io.emit("smsStatus", data);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Twilio error:", err.message);
    let errorText = err.message || "SMS failed";

    if (errorText.includes("verified")) {
      errorText +=
        " On a free Twilio trial, you can only send SMS to phone numbers verified in your Twilio console.";
    }

    io.emit("smsStatus", { errortext: errorText });
    res.status(400).json({ error: errorText });
  }
});

const PORT = process.env.PORT || 3000;
const Server = app.listen(PORT, () => {
  const status = getStatus();
  console.log(`Server started on port ${PORT}`);
  if (status.demoMode) {
    console.log("DEMO_MODE=true — SMS will be simulated, not delivered to phones");
  } else if (status.readyToSend) {
    console.log(`Twilio ready — sending from ${formatFromNumber(creds.fromNumber)}`);
  } else {
    console.log("Twilio not fully configured — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER");
  }
});

const io = socketio(Server);
io.on("connection", () => {
  console.log("Client connected");
});
