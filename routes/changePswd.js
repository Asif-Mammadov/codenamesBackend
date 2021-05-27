const express = require("express");
const mysql = require('mysql');
const path = require('path');
const Router = express.Router();

Router.get('/:id/updatePassword', function(req, res) {
    db.query('SELECT Password FROM User WHERE UserID = ?', [req.params.id], function(err, result, fields) {
        if(result.length > 0) {
            res.sendFile(path.resolve("views/account/changePswd.html"));
        } else {
            res.send('Invalid ID');
        }
    });
});

Router.post('/:id/updated', function(req, res) {
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

module.exports = Router;