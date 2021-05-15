const mysql = require('mysql');

const db = mysql.createConnection({
    host    : 'localhost',
    user    : 'phpmyadmin',
    password: 'Ufaz_2019',
    database: 'Codenames'
});

db.connect((err) => {
    if(err) throw err;
    console.log('Database Connected ...');
});

module.exports = db;