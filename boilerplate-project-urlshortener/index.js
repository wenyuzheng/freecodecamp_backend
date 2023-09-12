require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dns = require("dns");

// DB set up
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: Number,
});
const Url = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const validFormat = /http(s?):\/\/www./g;

  dns.lookup(req.body.url.replace(validFormat, ""), (err, adress, family) => {
    if (err || !validFormat.test(req.body.url)) {
      return res.json({ error: "invalid url" });
    } else {
      return res.json({ originalUrl: req.body.url });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
