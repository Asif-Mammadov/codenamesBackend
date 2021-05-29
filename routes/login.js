const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Router = express.Router();
const db = require('../config/connectDB');
const { sign } = require('jsonwebtoken');

Router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
Router.use(bodyParser.urlencoded({extended : true}));
Router.use(bodyParser.json());

Router.get('/login', function(req, res) {
    res.sendFile(path.resolve("views/account/login.html"));
});

Router.post('/auth', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if(email && password) {
        db.query('SELECT * FROM User WHERE Email = ? AND Password = ?', [email, password], function(err, results, fields) {
            if(err) {
				console.log(err);
			}
			if (results.length > 0) {
				req.session.loggedin = true;
				results.password = undefined;
				const jsontoken = sign({ result: results }, process.env.TOKEN_SECRET, {
					expiresIn: "1h"
				});
				return res.json({
					success: 1,
					message: "Login successfully",
					token: jsontoken
				});
			} else {
				return res.json({
					success: 0,
					message: "Invalid email or password"
				});
			}			
		});
	} else {
		return res.json({
			success: 0, 
			message: "No email and password entered"
		});
	}
});

module.exports = Router;