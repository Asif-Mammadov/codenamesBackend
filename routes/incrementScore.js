const express = require("express");
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const Router = express.Router();
const db = require('../config/connectDB');

Router.get('/:id/gameAction', function(req, res) {
    db.query('SELECT Username FROM User WHERE UserID = ?', [req.params.id], function(err, result, fields) {
        if(result.length > 0) {
            res.sendFile(path.resolve("views/account/game_action.html"));
        } else {
            return res.json({
                success: 0, 
                message: "Invalid ID"
            });
        }
    });
});

Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({extended : true}));

Router.post('/:id/countToDB', function(req, res) {
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

module.exports = Router;