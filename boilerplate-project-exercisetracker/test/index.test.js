const express = require("express");
const chai = require("chai");
const chaiHttp = require("chai-http");
const request = require("supertest");
const should = chai.should();
const { app, User } = require("../index");

chai.use(chaiHttp);

// describe("POST new user", () => {
//   it("Should create a new user", (done) => {
//     request(app)
//       .post("/api/users")
//       .send({ username: "user1" })
//       .end((err, res) => {
//         console.log({ res }, res.body);
//         res.should.have.status(200);
//         done();
//       })
//       .timeout(10000);
//   });
// });

describe("User Registration", () => {
  beforeEach((done) => {
    console.log(User);
    //Before each test we empty the database
    User.remove({}, (err) => {
      done();
    });
  });

  it("should register a new user with valid information", (done) => {
    request(app)
      .post("/api/users")
      .send({ username: "newuser" })
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("username").eql("newuser");
        done();
      })
      .catch((err) => console.log(err));
  });

  // Add other test cases for registration here
});
