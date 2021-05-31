const mysql = require('mysql');

const db_config = mysql.createPool({
    connectionLimit: 10,
    port : process.env.DB_PORT,
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.MYSQL_DB
});

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); 
                                                

  connection.connect(function(err) {           
    if(err) {                                 
      setTimeout(handleDisconnect, 2000); 
    }                                    
  });                                     
                                          
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
      throw err;                                 
    }
  });
}

handleDisconnect();
module.exports = db_config;