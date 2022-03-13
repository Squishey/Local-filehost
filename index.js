const express = require('express');
const app = express();
app.use(express.json());
const mysql = require('mysql');
const session = require('express-session');
const fs = require('fs');
const MySQLStore = require('express-mysql-session');
const { sendJson } = require('./utils');
const { Response } = require('./response');
const { login, register } = require('./signupin');
const { sqlInit } = require('./checksql');

sqlInit();

const db = mysql.createConnection({
    host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'nas',
});

// MySQL options for storing session :)
let options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'nas',
    createDatabaseTable: true,
    schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
};

let sessionStore = new MySQLStore(options); // New session object

let sess = {
    secret: "D99FDD13jE9v6S3s", // HMAC
    cookie: {},
    resave: false,
    saveUninitialized: false,
    store: sessionStore
} // HMAC and stuff

app.use(session(sess)); // Apply session
app.use(express.static('public')); // Set public as static for serving

if(app.get('env') === 'production'){
    sess.cookie.secure = true; // Only available with SSL certificate
}

db.connect(err => {
    if (err) throw err;
    console.log('MySql connected');
})

// Endpoints.

app.post('/register', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let registerRes = await register(username, password);

    if(registerRes.status === 200){
        fs.mkdir(__dirname + `/users/${username}`, { recursive: true }, (err) => {
            if(err) throw err;
            console.log('success ig')
        })
    }

    sendJson(res, registerRes);
})

app.post('/login', async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let loginRes = await login(username, password);

    if(loginRes.status === 200){
        req.session.loggedIn = true;
        req.session.username = username;
    }
    sendJson(res, loginRes);
})

app.get('/logout', (req, res) => {
    req.session.destroy();
})

app.post('/api/v1/upload', async(req, res) => {
    let fileName = req.body.fileName;
    let data = req.body.data;
})

app.get('/api/v1/get-file/:path', async(req, res) => {
    let username = req.session.username;
    let path = req.params.path;
    path = '/users/' + username + '/' + path

    fs.exists(__dirname + path, (doesExist) => {
        if(doesExist){
            res.sendFile(__dirname + path);
            return;
        }
        let resObj = new Response('error', '404', 'Unexistent file')
        sendJson(res, resObj)
    })
})

app.listen(3000, () => {
    console.log('Server started');
})