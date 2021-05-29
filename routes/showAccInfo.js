const express = require("express");
const db = require('../config/connectDB');
const Router = express.Router();

Router.get('/:id/showall', (req, res) => {
    var sql = `SELECT * FROM User WHERE UserID = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if(err) {
            console.log(err);
            return res.json({
                success: 0,
                message: "Database connection error"
            });
        }
        console.log(result);
        return res.json({
            success: 1,
            data: result
        });
   });
});

module.exports = Router;