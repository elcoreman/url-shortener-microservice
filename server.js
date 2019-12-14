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

const options = {
  family: 6,
  hints: dns.ADDRCONFIG | dns.V4MAPPED,
};

app.post("/api/shorturl/new",options, function(req, res) {
  dns.lookup(req.body.url, err => {
    if (err) res.json({ error: err });
    else {
      res.json({ greeting: req.body.url });
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
