const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const Router = express.Router();

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
        db.query('SELECT * FROM User WHERE Email = ? AND Password = ?', [email, password], function(err, result, fields) {
            if (result.length > 0) {
				req.session.loggedin = true;
				req.session.email = email;
				res.redirect('/home');
                console.log(result);
			} else {
				res.send('Incorrect Email and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Email and Password!');
		res.end();
	}
});

Router.get('/home', function(req, res) {
	if (req.session.loggedin) {
		res.send('Welcome !');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});

module.exports = Router;