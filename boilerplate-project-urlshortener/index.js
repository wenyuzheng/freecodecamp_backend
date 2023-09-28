require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const validURL = require("valid-url");

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
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

let count = 1;

app.post("/api/shorturl", (req, res) => {
  if (!validURL.isWebUri(req.body.url)) {
    console.log(req.body.url);
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
          count++;
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

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// /* eslint-disable no-unused-vars */
// /* eslint-disable no-undef */
// const express = require("express");
// const mongo = require("mongodb");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const validURL = require("valid-url");
// const shortID = require("shortid");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 3000;

// // MongoDB and mongoose connect
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Database schema
// const urlSchema = new mongoose.Schema({
//   originalURL: String,
//   shortURL: String,
// });

// const URL = mongoose.model("URL", urlSchema);

// // App middleware
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/public", express.static(`${process.cwd()}/public`));
// app.get("/", function (req, res) {
//   res.sendFile(`${process.cwd()}/views/index.html`);
// });

// // Response for POST request
// app.post("/api/shorturl", async (req, res) => {
//   const url = req.body.url;
//   const shortURL = shortID.generate();
//   console.log(validURL.isUri(url));
//   if (validURL.isWebUri(url) === undefined) {
//     res.json({
//       error: "invalid url",
//     });
//   } else {
//     try {
//       let findOne = await URL.findOne({
//         originalURL: url,
//       });
//       if (findOne) {
//         res.json({
//           original_url: findOne.originalURL,
//           short_url: findOne.shortURL,
//         });
//       } else {
//         findOne = new URL({
//           originalURL: url,
//           shortURL,
//         });
//         await findOne.save();
//         res.json({
//           original_url: findOne.originalURL,
//           short_url: findOne.shortURL,
//         });
//       }
//     } catch (err) {
//       console.log(err);
//       res.status(500).json("Server error..");
//     }
//   }
// });

// // Redirect shortened URL to Original URL
// // app.get("/api/shorturl/:shortURL?", async (req, res) => {
// //   try {
// //     const urlParams = await URL.findOne({
// //       shortURL: req.params.shortURL,
// //     });
// //     if (urlParams) {
// //       return res.redirect(urlParams.originalURL);
// //     }
// //     return res.status(404).json("No URL found");
// //   } catch (err) {
// //     console.log(err);
// //     res.status(500).json("Server error..");
// //   }
// // });
// // Listens for connections
// app.listen(port, function () {
//   console.log("Node.js listening ...");
// });
