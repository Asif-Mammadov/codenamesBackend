const express = require('express');
const path = require('path');
const Router = express.Router();

Router.get('/registration', function(req, res) {
    res.sendFile(path.resolve("views/account/register.html"));
});

Router.post('/registered', function(req, res) {
    let name_reg = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    if(req.body.phone) var phone = req.body.phone;

    if(password.length < 6) {
        res.send('Please enter more than 6 characters');
        res.end();
    } else {
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
    }
});

module.exports = Router;