"use strict";

const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGOLAB_URI, { useNewUrlParser: true })
  .catch(error => console.log(error));
console.log("mongoose connection readyState", mongoose.connection.readyState);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));
app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const URLSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
const URLModel = mongoose.model("URLModel", URLSchema);

app.post("/api/shorturl/new", (req, res) => {
  const myURL = new URL(req.body.url);
  const hostName = myURL.hostname.replace("www.", "");
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
              var short_url = 1;
              console.log(data);
              if (data) short_url = +data.short_url + 1;
              URLModel.create(
                { original_url: req.body.url, short_url },
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

app.get("/api/shorturl/:short_url", (req,res)=>{
  URLModel.findOne({short_url: req.short_url}, (err, data)=>{
    if(data){
      
    }else{
      res.json({"error":"No short url found for given input"});
    }
  });
});

app.listen(port, () => {
  console.log("Node.js listening ...");
});
