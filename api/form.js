const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./connectDB');

const app = express();

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Login page
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

//Registration page
app.get('/registration', function(req, res) {
    res.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/registered', function(req, res) {
    let name_reg = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    if(req.body.phone) var phone = req.body.phone;

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

    var query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        res.send('New User : ' + name_reg);
    });
});

//Edit page
app.get('/:id/edit', function(req, res) {
    var edit_id = req.params.id;
    db.query('SELECT * FROM User WHERE UserID = ?', [edit_id], function(err, result, fields) {
        if (result.length > 0) {
            res.sendFile(path.join(__dirname + '/edit.html'));    
        } else {
            res.send('Invalid ID');
        }			
    }); 
});

app.post('/:id/saved', function(req, res) {
    var edit_id = req.params.id;
    var sql = `SELECT Username, Email, PhoneNumber FROM User WHERE UserID = ${edit_id}`;
    var query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);

        if(req.body.name) var newName = req.body.name;
        else var newName = result[0].Username;

        if(req.body.email) var newEmail = req.body.email;
        else var newEmail = result[0].Email;

        if(req.body.phone) var newPhoneNumber = req.body.phone;
        else var newPhoneNumber = result[0].PhoneNumber;
    
        var sql_update = `UPDATE User SET Username = '${newName}', Email = '${newEmail}', PhoneNumber = ${newPhoneNumber} WHERE UserID = ${edit_id}`;
        var query_update = db.query(sql_update, (err, result) => {
            if(err) throw err;
            res.send('User Information Updated.');
        });
    });
});

module.exports = app;