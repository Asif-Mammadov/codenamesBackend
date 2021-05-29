const express = require("express");
const mysql = require('mysql');
const path = require('path');
const Router = express.Router();
const db = require('../config/connectDB');

Router.get('/:id/deleteAccount', function(req, res) {
    var id = req.params.id;
    db.query('SELECT * FROM User WHERE UserID = ?', [id], function(err, result, fields) {
        if (result.length > 0) {
            res.sendFile(path.resolve("views/account/delete.html"));
        } else {
            return res.json({
                success: 0, 
                message: "Invalid ID"
            });
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
                db.query(sql, (err, row) => {
                    if(err) {
                        console.log(err);
                        return res.json({
                            success: 0,
                            message: "Database connection error"
                        });
                    }
                    return res.json({
                        success: 1, 
                        message: "Account deleted"
                    });
                });
			} else {
				return res.json({
                    success: 0, 
                    message: "Wrong password"
                });
			}			
		});
    }  
});

module.exports = Router;