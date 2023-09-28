require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const validURL = require("valid-url");
const shortID = require("shortid");

// DB set up
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: String,
});
const Url = mongoose.model("URL", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  if (!validURL.isWebUri(req.body.url)) {
    return res.json({ error: "invalid url" });
  } else {
    Url.findOne({ original: req.body.url })
      .then((found) => {
        if (found) {
          return res.json({
            original_url: req.body.url,
            short_url: found.short,
          });
        } else {
          const count = shortID.generate();
          new Url({ original: req.body.url, short: count }).save();
          return res.json({
            original_url: req.body.url,
            short_url: count,
          });
        }
      })
      .catch((err) => console.log(err));
  }
});

app.get("/api/shorturl/:short_url?", (req, res) => {
  Url.findOne({ short: req.params.short_url }).then((found) => {
    if (found) {
      return res.redirect(found.original);
    } else {
      return res.status(404).json("No URL found");
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
