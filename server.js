"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var dns = require("dns");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

const URLSchema = new mongoose.Schema({
  url: String
});

const URL = mongoose.model("URL", URLSchema);

app.post("/api/shorturl/new", function(req, res) {
  const myURL = new URL(req.body.url);
  const hostName = myURL.hostname.replace("www.", "");
  dns.lookup(hostName, err => {
    if (err) {
      res.json({ error: "invalid URL" });
    } else {
      const url = new URL({ url: req.body.url });
      url.save(function(err, data) {
        if (err) return console.error(err);
        res.json({ data: data });
      });
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
