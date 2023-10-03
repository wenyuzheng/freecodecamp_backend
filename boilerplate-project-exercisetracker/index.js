require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// DB setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const newObj = new Exercise({
    userId,
    description,
    duration,
    date: date ? new Date(date) : new Date(),
  });

  User.findOne({ _id: userId }).then(async (user) => {
    if (!user) return res.json({ error: "User not found" });

    const obj = await newObj.save();
    return res.json({
      username: user.username,
      _id: obj.userId,
      description: obj.description,
      duration: obj.duration,
      date: obj.date.toDateString(),
    });
  });
});

// Get exercise logs
app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;

  User.findById(req.params._id)
    .then((foundUser) => {
      if (!foundUser) return res.json({ error: "UserId not found" });

      Exercise.find({ userId: req.params._id })
        .then((data) => {
          let log = data.map((d) => {
            return {
              description: d.description,
              duration: d.duration,
              date: new Date(d.date).toDateString(),
            };
          });

          if (from || to) {
            log = log.filter((e) => e.date >= from || e.date <= to);
          }

          if (limit) {
            log = log.splice(0, limit);
          }

          return res.json({
            username: foundUser.username,
            _id: foundUser._id,
            count: data.length,
            log: log,
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
