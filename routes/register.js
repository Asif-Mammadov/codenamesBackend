const express = require('express');
const path = require('path');
const Router = express.Router();
const db = require('../config/connectDB');
const { sign } = require('jsonwebtoken');
const bodyParser = require('body-parser');

Router.use(bodyParser.urlencoded({extended : true}));
Router.use(bodyParser.json());

Router.get('/registration', function(req, res) {
    res.sendFile(path.resolve("views/account/register.html"));
});

Router.post('/registered', function(req, res) {
    let name_reg = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    if(req.body.phone) var phone = req.body.phone;

    if(password.length < 6) {
        return res.json({
            success: 0,
            message: "Too short password."
        });
    } else {
        var sql = 'SELECT * FROM User WHERE Email = ? OR Username= ?'
        db.query(sql, [email, name_reg], function(err, rows){
            if(err){
                db.end();
                return console.log(err);
            }
            if(rows.length){
                db.end();
                return res.json({
                    success: 0,
                    message: "User already exists"
                });
            }
        })
        if(phone) {
            var post = {Username: name_reg, Email: email, Password: password, PhoneNumber:phone, CreationDate: new Date(),
                        Wins: 0, Draws: 0, Loses: 0, GuessedRightAsOperative: 0, GuessedWrongAsOperative: 0,
                        GuessedRightAsSpymaster: 0, GuessedWrongAsSpymaster: 0};
        } else {
            var post = {Username: name_reg, Email: email, Password: password, PhoneNumber: null, CreationDate: new Date(),
                        Wins: 0, Draws: 0, Loses: 0, GuessedRightAsOperative: 0, GuessedWrongAsOperative: 0,
                        GuessedRightAsSpymaster: 0, GuessedWrongAsSpymaster: 0};
        }

        var sql = 'INSERT INTO User SET ?';

        db.query(sql, post, (err, results) => {
            if(err) {
                console.log(err);
                db.end();
                return res.json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            results.password = undefined;
            const jsontoken = sign({ result: results }, process.env.TOKEN_SECRET, {
                expiresIn: "1h"
            });
            db.end();
            return res.json({
                success: 1,
                message: "Successfully registered",
                token: jsontoken
            });
        });
    }
});

module.exports = Router;