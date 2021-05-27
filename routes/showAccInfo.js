const express = require("express");
const mysql = require('mysql');
const Router = express.Router();

Router.get('/:id/showall', (req, res) => {
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

module.exports = Router;