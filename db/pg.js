const { Pool, Client } = require('pg')
const dotenv = require('dotenv');
dotenv.config();

const db = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
})

async function getBooths(){
	try {
		let { rows } = await db.query('SELECT * FROM booths');
		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function addBooth(uid, bnumber, bname, bannotations){
	try{
		let { rows } = await db.query('INSERT into booths(uid, number, name, annotations) values ($1, $2, $3, $4)', [uid, bnumber, bname, bannotations])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function deleteBooth(uid){
	try{
		let { rows } = await db.query('DELETE from booths WHERE uid = $1', [uid])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function editBooth(uid, bnumber, bname, bannotations){
	try {
		let { rows } = await db.query('UPDATE booths SET (number, name, annotations) = ($2, $3, $4) where uid = $1', [uid, bnumber, bname, bannotations])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

module.exports = {
	getBooths,
	addBooth,
	deleteBooth,
	editBooth
}