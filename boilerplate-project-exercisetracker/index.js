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

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Post new user
app.post("/api/users", (req, res) => {
  User.create({
    username: req.body.username,
  }).then((data) => {
    return res.json({ username: data.username, _id: data._id });
  });
});

// Get all user
app.get("/api/users", (req, res) => {
  User.find().then((allUsers) => {
    res.json(allUsers);
  });
});

// Post new exercise

// Get exercise logs

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
