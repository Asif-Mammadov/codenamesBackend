const express = require("express");
const mysql = require('mysql');
const path = require('path');
const Router = express.Router();

Router.get('/:id/deleteAccount', function(req, res) {
    var id = req.params.id;
    db.query('SELECT * FROM User WHERE UserID = ?', [id], function(err, result, fields) {
        if (result.length > 0) {
            res.sendFile(path.resolve("views/account/delete.html"));
        } else {
            res.send('Invalid ID');
        }			
    }); 
});

Router.post('/:id/deleted', (req, res) => {
    var id = req.params.id;
    var password = req.body.password;
    if(password) {
        db.query('SELECT * FROM User WHERE Password = ?', [password], function(err, result) {
            if (result.length > 0) {
				var sql = `DELETE FROM User WHERE UserID = ${id}`;
                var query = db.query(sql, (err, row) => {
                    if(err) throw err;
                    res.send('Account deleted.');
                });
			} else {
				res.send('Incorrect Password!');
			}			
		});
    }  
});

module.exports = Router;