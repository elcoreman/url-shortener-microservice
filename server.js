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

mongoose
  .connect(process.env.MONGOLAB_URI, { useNewUrlParser: true })
  .catch(error => console.log(error));
console.log("mongoose connection readyState", mongoose.connection.readyState);
app.use(cors()); //

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

var URLSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

var URLModel = mongoose.model("URLModel", URLSchema);

var findOneByURL = (url, done) => {
  URLModel.findOne({ url: url }, (err, data) => {
    if (err) return console.log(err);
    done(data);
  });
};

app.post("/api/shorturl/new", function(req, res) {
  var myURL = new URL(req.body.url);
  var hostName = myURL.hostname.replace("www.", "");
  dns.lookup(hostName, err => {
    if (err) {
      res.json({ error: "invalid URL" });
    } else {
      URLModel.findOne({ original_url: req.body.url }, (err, data) => {
        if (err) return console.error(err);
        if (data) {
          res.json({
            original_url: data.original_url,
            short_url: data.short_url
          });
        } else {
          URLModel.findOne()
            .sort({ field: "asc", _id: -1 })
            .limit(1)
            .exec((err, data) => {
              if (err) return console.error(err);
              URLModel.create(
                { original_url: req.body.url, short_url: data.short_url++ },
                (err, data) => {
                  if (err) return console.error(err);
                  res.json({
                    original_url: data.original_url,
                    short_url: data.short_url
                  });
                }
              );
            });
        }
      });
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
