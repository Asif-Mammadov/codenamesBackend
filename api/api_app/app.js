const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
//const { read } = require('fs');

//Create connection
const db = mysql.createConnection({
    host    : 'localhost',
    user    : 'phpmyadmin',
    password: 'Ufaz_2019',
    database: 'Codenames'
});

//Connect 
db.connect((err) => {
    if(err) throw err;
    console.log('Database Connected ...');
});

const app = express();

//Show score of the user 
app.get('/showScore/:id', (req, res) => {
    let sql = `SELECT Username, Wins, Draws, Loses, GuessedRightAsOperative, GuessedWrongAsOperative, GuessedRightAsSpymaster, GuessedWrongAsSpymaster FROM User WHERE UserID = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result[0].Username + '\'s Results <br><hr>' + 
            '<br>   Wins : ' + result[0].Wins +  
            '<br>   Draws : ' + result[0].Draws +
            '<br>   Loses : ' + result[0].Loses +
            '<hr><br> As operative ' +
            '<br> Right guesses    : ' + result[0].GuessedRightAsOperative +
            '<br> Wrong guesses    : ' + result[0].GuessedWrongAsOperative +
            '<hr><br> As spymaster ' +
            '<br> Right guesses    : ' + result[0].GuessedRightAsSpymaster +
            '<br> Wrong guesses    : ' + result[0].GuessedWrongAsSpymaster );
    });
});

app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname + '/scores.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

//Increment score of the user
app.post('/countToDB', function(req, res) {
    var actionId = req.body.button;
    var userId = req.body.userId;
    if(userId) {
        db.query('SELECT Username FROM User WHERE UserID = ?', [userId], function(err, result, fields) {
            if(result.length > 0) {
                if(actionId == 1) 
                    db.query('UPDATE User SET Wins = Wins + 1 WHERE UserID = ?', [userId]);
                if(actionId == 2) 
                    db.query('UPDATE User SET Draws = Draws + 1 WHERE UserID = ?', [userId]);
                if(actionId == 3) 
                    db.query('UPDATE User SET Loses = Loses + 1 WHERE UserID = ?', [userId]);
                if(actionId == 4) 
                    db.query('UPDATE User SET GuessedRightAsOperative = GuessedRightAsOperative + 1 WHERE UserID = ?', [userId]);
                if(actionId == 5) 
                    db.query('UPDATE User SET GuessedWrongAsOperative = GuessedWrongAsOperative + 1 WHERE UserID = ?', [userId]);
                if(actionId == 6) 
                    db.query('UPDATE User SET GuessedRightAsSpymaster = GuessedRightAsSpymaster + 1 WHERE UserID = ?', [userId]);
                if(actionId == 7) 
                    db.query('UPDATE User SET GuessedWrongAsSpymaster = GuessedWrongAsSpymaster + 1 WHERE UserID = ?', [userId]);
                
                res.redirect('/updated');
                res.end();
            } else { 
                res.send('No user with this id yet');
            }
            res.end();
        });       
    } else {
        res.send('Enter id and Select action');
        res.end(); 
    } 
});

//Redirect of /countToDB
app.get('/updated', function(req, res) {   
    res.send("Score updated");   
    res.end();
});

//Show friends list
//rating of the users 
//add a friend 

app.listen(3000, () => console.log('PORT : 3000'));