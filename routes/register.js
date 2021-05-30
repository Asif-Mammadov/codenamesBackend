const express = require("express");
const path = require("path");
const Router = express.Router();
const db = require("../config/connectDB");
const { sign } = require("jsonwebtoken");
const bodyParser = require("body-parser");

Router.use(bodyParser.urlencoded({ extended: true }));
Router.use(bodyParser.json());

Router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
Router.get("/registration", function (req, res) {
  return res.sendFile(path.resolve("views/account/register.html"));
});

Router.post("/register", function (req, res) {
  db.connect();
  let name_reg = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  if (req.body.phone) var phone = req.body.phone;

  if (password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Too short password.",
    });
  } else {
    var sql = "SELECT * FROM User WHERE Email = ? OR Username= ?";
    db.query(sql, [email, name_reg], function (err, rows) {
      if (err) {
        return console.log(err);
      }
      if (rows.length) {
        return res.status(400).json({
          status: "error",
          message: "User already exists",
        });
      }
      db.end();
    });
    if (phone) {
      var post = {
        Username: name_reg,
        Email: email,
        Password: password,
        PhoneNumber: phone,
        CreationDate: new Date(),
        Wins: 0,
        Draws: 0,
        Loses: 0,
        GuessedRightAsOperative: 0,
        GuessedWrongAsOperative: 0,
        GuessedRightAsSpymaster: 0,
        GuessedWrongAsSpymaster: 0,
      };
    } else {
      var post = {
        Username: name_reg,
        Email: email,
        Password: password,
        PhoneNumber: null,
        CreationDate: new Date(),
        Wins: 0,
        Draws: 0,
        Loses: 0,
        GuessedRightAsOperative: 0,
        GuessedWrongAsOperative: 0,
        GuessedRightAsSpymaster: 0,
        GuessedWrongAsSpymaster: 0,
      };
    }

    var sql = "INSERT INTO User SET ?";

    db.query(sql, post, (err, results) => {
      console.log(results.insertId);
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: "error",
          message: "Database connection error",
        });
      }
      results.password = undefined;
      const jsontoken = sign({ result: results }, process.env.TOKEN_SECRET, {
        expiresIn: "1h",
      });
      return res.status(200).json({
        status: "success",
        message: "Successfully registered",
        token: jsontoken,
        userID: results.insertId,
      });
      db.end();
    });
  }
});

module.exports = Router;
