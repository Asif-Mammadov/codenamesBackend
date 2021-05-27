const express = require("express");
const mysql = require('mysql');
const Router = express.Router();

Router.get('/:id/rating', function(req, res) {   
    db.query('SELECT Username FROM User WHERE UserID = ?', [req.params.id], function(err, result) {
        if(result.length > 0) {
            db.query('SELECT Username, SUM(Wins * 10 - Loses * 5 + GuessedRightAsOperative + GuessedRightAsSpymaster - GuessedWrongAsOperative - GuessedWrongAsSpymaster) AS score FROM User GROUP BY UserID ORDER BY score DESC', function(err, row) {
                var i = 0;
                while (row[i]) {
                    console.log(row[i]);
                    if(row[i].Username == result[0].Username) 
                        row[i].Username == 'You';
                    i++;
                }
                res.json(row);
            });
        } else {
            res.send('Invalid ID');
        }
    });
});

module.exports = Router;