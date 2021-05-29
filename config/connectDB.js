const mysql = require('mysql');

const db = mysql.createConnection({
    port : process.env.DB_PORT,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.MYSQL_DB
});

let pool = mysql.createPool(db);

pool.on('connection', function (_conn) {
    if (_conn) {
        logger.info('Connected the database via threadId %d!!', _conn.threadId);
        _conn.query('SET SESSION auto_increment_increment=1');
    }
});


module.exports = db;