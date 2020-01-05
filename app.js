const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const Nexmo = require("nexmo");
const socketio = require("socket.io");

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

//define PORT
const PORT = 3000;

//Start Server
const Server = app.listen(PORT, () =>
  console.log(`Server Started at PORT ${PORT}`)
);
