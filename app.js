const express = require('express');
const app = express();

const pgdb = require('./db/pg');
const dotenv = require('dotenv');
dotenv.config();

const hostname = '127.0.0.1';
const port = 3000;

const pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const { v4: uuidv4 } = require('uuid');
 
const pgPool = new pg.Pool({
    user: process.env.PG_USER,
	host: process.env.PG_HOST,
	database: process.env.PG_DB,
	password: process.env.PG_PASS,
	port: process.env.PG_PORT,
});
 
app.use(session({
  store: new pgSession({
    pool : pgPool,                
    tableName : 'session'   
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.get('/', function (req, res) {
  res.send('EXHIBITION CMS BACKEND')
})

//BOOTHS
//Get all booths
app.get('/getbooth', async (req, res) => {
	let response = await pgdb.getBooths();
	
	res.send(response);
})

//Add a booth 
//Requires a request body (booth number, booth name, booth annotations as JSON)
app.post('/addbooth', async (req, res) => {
	let response = await pgdb.addBooth(uuidv4(), req.body.number, req.body.name, req.body.annotations);
	
	res.send(response);
})

//Delete a booth
//Requires a request body (uid)
app.delete('/deletebooth', async (req, res) => {
	let response = await pgdb.deleteBooth(req.body.uid);

	res.send(response);
})

//Update a booth
//Requires a request body (booth uid, booth number, booth name, booth annotations as JSON)
app.put('/editbooth', async (req, res) => {
	let response = await pgdb.editBooth(req.body.uid, req.body.number, req.body.name, req.body.annotations);

	res.send(response);
})
 
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});