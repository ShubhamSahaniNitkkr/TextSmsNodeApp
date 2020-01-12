const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const Nexmo = require("nexmo");
const socketio = require("socket.io");

// Init Nexmo
const nexmo = new Nexmo(
  {
    apiKey: "c4b7a214",
    apiSecret: "AEPixnS5oYnPBg2C"
  },
  { debug: true }
);

// Init App
const app = express();

// Template engine setup
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

// Public Folder Setup
app.use(express.static(__dirname + "/public"));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Home Route
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  res.send(req.body);
  const number = req.body.number;
  const msg = req.body.msg;
  nexmo.message.sendSms(
    "+919771823804",
    number,
    msg,
    {
      type: "unicode"
    },
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        console.dir(responseData);
      }
    }
  );
});

//define PORT
const PORT = 3000;

//Start Server
const Server = app.listen(PORT, () =>
  console.log(`Server Started at PORT ${PORT}`)
);
