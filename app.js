const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const socketio = require("socket.io");

const isDemoMode = () => process.env.DEMO_MODE === "true";

let nexmo = null;
if (!isDemoMode() && process.env.NEXMO_API_KEY && process.env.NEXMO_API_SECRET) {
  const Nexmo = require("nexmo");
  nexmo = new Nexmo(
    {
      apiKey: process.env.NEXMO_API_KEY,
      apiSecret: process.env.NEXMO_API_SECRET
    },
    { debug: false }
  );
}

const app = express();

app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/status", (req, res) => {
  res.json({ demoMode: isDemoMode(), nexmoConfigured: !!nexmo });
});

app.get("/", (req, res) => {
  res.render("index", { demoMode: isDemoMode() });
});

app.post("/", (req, res) => {
  const number = req.body.number;
  const msg = req.body.msg;

  if (isDemoMode() || !nexmo) {
    const data = {
      id: "demo-" + Date.now(),
      number,
      balance: "10.00",
      charge: "0.05",
      errortext: null,
      demoMode: true
    };
    io.emit("smsStatus", data);
    return res.json({ success: true, demoMode: true });
  }

  const fromNumber = process.env.NEXMO_FROM_NUMBER || process.env.NEXMO_FROM;
  nexmo.message.sendSms(fromNumber, number, msg, { type: "unicode" }, (err, responseData) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "SMS failed" });
    }
    const data = {
      id: responseData.messages[0]["message-id"],
      number: responseData.messages[0]["to"],
      balance: responseData.messages[0]["remaining-balance"],
      charge: responseData.messages[0]["message-price"],
      errortext: responseData.messages[0]["error-text"]
    };
    io.emit("smsStatus", data);
    res.json({ success: true });
  });
});

const PORT = process.env.PORT || 3000;
const Server = app.listen(PORT, () => {
  console.log(`Server Started at PORT ${PORT}`);
  if (isDemoMode()) {
    console.log("DEMO_MODE: SMS simulated (no Nexmo API calls)");
  }
});

const io = socketio(Server);
io.on("connection", () => {
  console.log("client connected");
});
