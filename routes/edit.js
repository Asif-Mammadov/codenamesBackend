const express = require('express');
const path = require('path');
const Router = express.Router();

Router.get('/:id/edit', function(req, res) {
    var edit_id = req.params.id;
    db.query('SELECT * FROM User WHERE UserID = ?', [edit_id], function(err, result, fields) {
        if (result.length > 0) {
            res.sendFile(path.resolve("views/account/edit.html"));
        } else {
            res.send('Invalid ID');
        }			
    }); 
});

Router.post('/:id/saved', function(req, res) {
    var edit_id = req.params.id;
    var sql = `SELECT Username, Email, PhoneNumber FROM User WHERE UserID = ${edit_id}`;
    var query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);

        if(req.body.name) var newName = req.body.name;
        else var newName = result[0].Username;

        if(req.body.email) var newEmail = req.body.email;
        else var newEmail = result[0].Email;

        if(req.body.phone) var newPhoneNumber = req.body.phone;
        else var newPhoneNumber = result[0].PhoneNumber;
    
        var sql_update = `UPDATE User SET Username = '${newName}', Email = '${newEmail}', PhoneNumber = ${newPhoneNumber} WHERE UserID = ${edit_id}`;
        var query_update = db.query(sql_update, (err, result) => {
            if(err) throw err;
            res.send('User Information Updated.');
        });
    });
});

module.exports = Router;