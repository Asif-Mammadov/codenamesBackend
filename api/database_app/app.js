const express = require('express');
const mysql = require('mysql');

//Create connection
const db = mysql.createConnection({
    host    : 'localhost',
    user    : 'phpmyadmin',
    password: 'Ufaz_2019',
    database: 'Codenames'
});

//Connect 
db.connect((err) => {
    if(err) throw err;
    console.log('Database Connected ...');
});

const app = express();

//Insert record into User table
app.get('/addpostUser', (req, res) => {
    let post = {Username:'Sabina',Email:'sab@',Password:'123',PhoneNumber:'055',CreationDate:new Date()};
    let sql = 'INSERT INTO User SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('One record inserted.');
    });
});

//Select all posts from User table
app.get('/getpostsUser', (req, res) => {
    let sql = 'SELECT * FROM User';
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        console.log(results);
        res.send('Posts fetched.');
    });
});

//Select single post form User table
app.get('/getpostsUser/:id', (req, res) => {
    let sql = `SELECT * FROM User WHERE UserID = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post fetched...');
    });
});

//Update Username
app.get('/updateUsername/:id', (req, res) => {
    let newName = 'Lyly';
    let sql = `UPDATE User SET Username = '${newName}' WHERE UserID = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Username updated.');
    });
});

//Update Email
app.get('/updateEmail/:id', (req, res) => {
    let newEmail = 'lyly@';
    let sql = `UPDATE User SET Email = '${newEmail}' WHERE UserID = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Email updated.');
    });
});

//Update PhoneNumber
app.get('/updatePhoneNumber/:id', (req, res) => {
    let newPhoneNumber = '070';
    let sql = `UPDATE User SET PhoneNumber = '${newPhoneNumber}' WHERE UserID = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('PhoneNumber updated.');
    });
});

//Update Password
//check the old one 
app.get('/updatePassword/:id', (req, res) => {
    let newPassword = '000';
    let sql = `UPDATE User SET Password = '${newPassword}' WHERE UserID = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Password updated.');
    });
});

//Delete post 
app.get('/deletepost/:id', (req, res) => {
    let tableName = 'User';
    let idName = 'UserID';
    let sql = `DELETE FROM ${tableName} WHERE ${idName} = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post deleted.');
    });
});

app.listen('5000', () => {
    console.log('Server started on port 5000');
});