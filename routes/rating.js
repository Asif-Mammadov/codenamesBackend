const express = require("express");
const Router = express.Router();
const db = require('../config/connectDB');

Router.get('/:id/rating', function(req, res) {   
    db.query('SELECT Username FROM User WHERE UserID = ?', [req.params.id], function(err, result) {
        if(result.length > 0) {
            db.query('SELECT Username, SUM(Wins * 10 - Loses * 5 + GuessedRightAsOperative + GuessedRightAsSpymaster - GuessedWrongAsOperative - GuessedWrongAsSpymaster) AS score FROM User GROUP BY UserID ORDER BY score DESC', function(err, row) {
                var i = 0;
                if(err) {
                    console.log(err);
                    return res.json({
                        success: 0,
                        message: "Database connection error"
                    });
                }
                while (row[i]) {
                    console.log(row[i]);
                    if(row[i].Username == result[0].Username) 
                        row[i].Username == 'You';
                    i++;
                }
                return res.json({
                    success: 1, 
                    data: row
                });
            });
        } else {
            return res.json({
                success: 0, 
                message: "Invalid ID"
            });
        }
    });
});

module.exports = Router;