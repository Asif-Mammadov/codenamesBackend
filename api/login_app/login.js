const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

//Create connection
const db = mysql.createConnection({
    host    : 'localhost',
    user    : 'phpmyadmin',
    password: 'Ufaz_2019',
    database: 'Codenames'
});

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(req, res) {
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

app.get('/home', function(req, res) {
	if (req.session.loggedin) {
		res.send('Welcome !');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});

app.listen(3300);