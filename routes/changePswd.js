const express = require("express");
const mysql = require('mysql');
const path = require('path');
const Router = express.Router();
const db = require('../config/connectDB');

Router.get('/:id/updatePassword', function(req, res) {
    db.query('SELECT Password FROM User WHERE UserID = ?', [req.params.id], function(err, result, fields) {
        if(result.length > 0) {
            res.sendFile(path.resolve("views/account/changePswd.html"));
        } else {
            return res.json({
                success: 0,
                message: "Invalid ID"
            });
        }
    });
});

Router.post('/:id/password', function(req, res) {
    db.query('SELECT Password FROM User WHERE UserID = ?', [req.params.id], function(err, result, fields) {
        var pswd = result[0].Password;
    
        var curr_pswd = req.body.current;
        var new_pswd = req.body.confirm;
        if(curr_pswd === pswd) {
            if(curr_pswd === new_pswd) {
                return res.json({
                    success: 0, 
                    message: "Same password as current"
                });
            } else {
                var sql = `UPDATE User SET Password = '${new_pswd}' WHERE UserID = ${req.params.id}`;
                db.query(sql, (err, result) => {
                    if(err) {
                        console.log(err);
                        return res.json({
                            success: 0,
                            message: "Database connection error"
                        });
                    }
                    return res.json({
                        success: 1, 
                        message: "Password updated"
                    });
                });
            }
        } else {
            return res.json({
                success: 0, 
                message: "Current password does not match."
            });
        }
    });
});

module.exports = Router;