const bcrypt = require('bcrypt');
const { Response } = require('./response')
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

function userExistss(username){
	return new Promise((resolve, reject) => {
		db.query('SELECT username FROM users WHERE username = ?', [username], (err, result) => {

			if(err){ resolve('error') }

			if(result[0]){ resolve(true) }

			resolve(false)
		})
	})
}

function register(username, password){
	return new Promise(async(resolve, reject) => {
		let userExists = await userExistss(username);
		if(userExists == false){
			let hash = await bcrypt.hash(password.toString(), 10);
			db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, result) => {
				let resObj = new Response('error', 500, null);
				if(err){ resolve(resObj); console.log(err);return; };

				resObj = new Response('registerSuccess', 200, null);
				resolve(resObj);
			})
			return;
		}
		if(userExists === 'error'){
			let resObj = new Response('error', 500, null);
			resolve(resObj);
			return;
		}
		let resObj = new Response('error', 401, 'Username already in use');
		resolve(resObj);
	})
}

function login(username, password){
	return new Promise(async(resolve, reject) => {
		let userExists = await userExistss(username);
		if(userExists === true){
			db.query('SELECT password FROM users WHERE username = ?', [username], (err, result) => {
				let resObj = new Response('error', 500, null);
				if(err) { resolve(resObj) }

				let hash = result[0].password;
				bcrypt.compare(password, hash, (err, result) => {
					if(err) { resolve(resObj) };
					if(result === true){
						let resObj = new Response('authSuccess', 200, null);
						resolve(resObj);
					}
					let resObj = new Response('error', 402, 'Invalid credentials');
					resolve(resObj);
				})
			})
			return;
		}
		if(userExists === 'error'){
			let resObj = new Response('error', 500, null);
			resolve(resObj);
			return;
		}

		let resObj = new Response('error', 402, 'Invalid credentials');
		resolve(resObj);
		return;
	})
}

module.exports = { login, register }