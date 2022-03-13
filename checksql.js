const mysql = require('mysql');

// MySQL setup
const db = mysql.createConnection({
    host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'nas',
});

db.connect(err => {
    if (err) throw err;
    console.log('MySql connected');
})

function checkUsersTable(){
    db.query('CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255))', (err, result) => {
        if(err) {throw err}
        console.log('Users table created');
    })
}

function sqlInit(){
    checkUsersTable();
}

module.exports = { sqlInit };