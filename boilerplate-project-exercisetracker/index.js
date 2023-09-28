const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

// Post new user
app.post("/api/users", (req, res) => {
  User.create({
    username: req.body.username,
  }).then((data) => {
    return res.json({ username: data.username, _id: data._id });
  });
});

// Get all users
app.get("/api/users", (req, res) => {
  User.find().then((allUsers) => {
    res.json(allUsers);
  });
});

// Post new exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  // Exercise.create({
  //   userId: req.body[":_id"],
  //   description: req.body.description,
  //   duration: req.body.duration,
  //   date: req.body.date ? new Date(req.body.date) : new Date(),
  // }).then((data) => {
  //   console.log(data);

  //   User.findById(data.userId).then((foundUser) => {
  //     return res.json({
  //       _id: data.userId,
  //       username: foundUser.username,
  //       description: data.description,
  //       duration: data.duration,
  //       date: data.date.toDateString(),
  //     });
  //   });
  // });

  const date = req.body.date ? new Date(req.body.date) : new Date();
  const duration = parseInt(req.body.duration);

  if (date == "Invalid Date") return res.json({ error: "Invalid Date" });
  if (isNaN(duration)) return res.json({ error: "Duration must be a integer" });

  if (!req.body[":_id"] || !req.body.description || !duration) {
    return res.json({ error: "More info needed" });
  }

  User.findById(req.body[":_id"]).then((foundUser) => {
    if (!foundUser) return res.json({ error: "UserId not found" });

    Exercise.create({
      userId: foundUser._id,
      description: req.body.description,
      duration: req.body.duration,
      date: date,
    });

    return res.json({
      _id: foundUser._id,
      username: foundUser.username,
      description: req.body.description,
      duration: duration,
      date: date.toDateString(),
    });
  });
});

// Get exercise logs
app.get("/api/users/:_id/logs", (req, res) => {
  console.log(`req.body: ${JSON.stringify(req.body)}`);
  console.log(`req.params: ${JSON.stringify(req.params)}`);
  console.log(`req.query: ${JSON.stringify(req.query)}`);

  User.findById(req.params._id)
    .then((foundUser) => {
      // console.log({ foundUser });

      if (!foundUser) return res.json({ error: "UserId not found" });

      Exercise.find({ userId: req.params._id })
        .then((data) => {
          // console.log(data.length, { data });

          return res.json({
            username: foundUser.username,
            _id: foundUser._id,
            count: data.length,
            log: data.map((d) => {
              return {
                description: d.description,
                duration: d.duration,
                date: new Date(d.date).toDateString(),
              };
            }),
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

module.exports = { app: app.listen(3001), User };
