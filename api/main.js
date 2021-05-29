const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./connectDB');
const app = require('./form');

//Show Account Information
app.get('/:id/showall', (req, res) => {
    var sql = `SELECT * FROM User WHERE UserID = ${req.params.id}`;
    var query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        var nowDate = new Date();
        var date = nowDate.toISOString().slice(0,10);
 
        res.send(result[0].Username + '<hr>' + 
            '<br>   Email :         ' + result[0].Email +
            '<br>   Phone Number :  ' + result[0].PhoneNumber + 
            '<hr><br>   Wins :          ' + result[0].Wins +  
            '<br>   Draws :         ' + result[0].Draws +
            '<br>   Loses :         ' + result[0].Loses +
            '<hr><br> As operative ' +
            '<br> Right guesses :   ' + result[0].GuessedRightAsOperative +
            '<br> Wrong guesses :   ' + result[0].GuessedWrongAsOperative +
            '<hr><br> As spymaster ' +
            '<br> Right guesses :   ' + result[0].GuessedRightAsSpymaster +
            '<br> Wrong guesses :   ' + result[0].GuessedWrongAsSpymaster +
            '<br><hr> Creation Date :   ' + date);
    });
});

//Update Password
app.get('/:id/updatePassword', function(req, res) {
    db.query('SELECT Password FROM User WHERE UserID = ?', [req.params.id], function(err, result, fields) {
        if(result.length > 0) {
            res.sendFile(path.join(__dirname + '/changePswd.html'));
        } else {
            res.send('Invalid ID');
        }
    });
});

app.post('/:id/updated', function(req, res) {
    db.query('SELECT Password FROM User WHERE UserID = ?', [req.params.id], function(err, result, fields) {
        var pswd = result[0].Password;
        console.log('Current Password : ' + pswd);
    
        var curr_pswd = req.body.current;
        var new_pswd = req.body.confirm;
        if(curr_pswd === pswd) {
            if(curr_pswd === new_pswd) {
                res.send('You Cannot Change to the save Password:/');
            } else {
                var sql = `UPDATE User SET Password = '${new_pswd}' WHERE UserID = ${req.params.id}`;
                var query = db.query(sql, (err, result) => {
                    if(err) throw err;
                    res.send('Password updated.');
                });
            }
        } else {
            res.send('Current Password Does Not Match. Please try again.')
        }
    });
});

//Game Action
app.get('/:id/gameAction', function(req, res) {
    db.query('SELECT Username FROM User WHERE UserID = ?', [req.params.id], function(err, result, fields) {
        if(result.length > 0) {
            res.sendFile(path.join(__dirname + '/game_action.html'));
        } else {
            res.send('Invalid ID');
        }
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

//Increment score of the user
app.post('/:id/countToDB', function(req, res) {
    var actionId = req.body.button;
    var id = req.params.id;

    if(actionId == 1) 
        db.query('UPDATE User SET Wins = Wins + 1 WHERE UserID = ?', [id]);
    if(actionId == 2) 
        db.query('UPDATE User SET Draws = Draws + 1 WHERE UserID = ?', [id]);
    if(actionId == 3) 
        db.query('UPDATE User SET Loses = Loses + 1 WHERE UserID = ?', [id]);
    if(actionId == 4) 
        db.query('UPDATE User SET GuessedRightAsOperative = GuessedRightAsOperative + 1 WHERE UserID = ?', [id]);
    if(actionId == 5) 
        db.query('UPDATE User SET GuessedWrongAsOperative = GuessedWrongAsOperative + 1 WHERE UserID = ?', [id]);
    if(actionId == 6) 
        db.query('UPDATE User SET GuessedRightAsSpymaster = GuessedRightAsSpymaster + 1 WHERE UserID = ?', [id]);
    if(actionId == 7) 
        db.query('UPDATE User SET GuessedWrongAsSpymaster = GuessedWrongAsSpymaster + 1 WHERE UserID = ?', [id]);
    res.send('Score UPDATED');
});

//Rating page
app.get('/rating', function(req, res) {   
    db.query('SELECT * FROM User', function(err, result, fields) {
        if(err) throw err;
        res.send(result);		
    }); 
});



app.listen('3000', () => {
    console.log('Server started on port 3000');
});