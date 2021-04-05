const { Pool, Client } = require('pg')
const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config();

const db = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
})


//BOOTHS
async function getBooths(){
	try {
		let { rows } = await db.query('SELECT * FROM booths order by number ASC');
		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function getBooth(uid){
	try {
		let { rows } = await db.query('SELECT * FROM booths where uid = $1', [uid]);
		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function addBooth(uid, bnumber, bname){
	try{
		let { rows } = await db.query('INSERT into booths (uid, number, name) values ($1, $2, $3)', [uid, bnumber, bname])

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

async function editBooth(uid, bnumber, bname){
	try {
		let { rows } = await db.query('UPDATE booths SET (number, name) = ($2, $3) where uid = $1', [uid, bnumber, bname])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}
//

//USERS

async function registerUser(uid, email, password, role, props = {}){
	try {
		let { rows } = await db.query('insert into users (uid, email, password, role, props, register_date) values ($1, $2, $3, $4, $5, $6)', [uid, email, password, role, props, moment().format('MMMM Do YYYY, h:mm:ss a')])

		return rows;
	} catch (err){
		return ({error: true, message: err.toString()})
	}
}

async function getUser(email){
	try{
		let { rows } = await db.query('select * from users where email = $1', [email]);

		return rows;
	} catch (err){
		return ({error: true, message: err.toString()})
	}
}

async function getAdmin(){
	try {
		let { rows } = await db.query("select * from users where role = 'admin'");

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function getUsersData(){
	try {
		let { rows } = await db.query("select * from users where role = 'user'")

		return rows;
	} catch (err){
		return ({error: true, message: err.toString()})
	}
}

async function updateUser(email, props){
	try{
		let { rows } = await db.query('update users set props = $2 where email = $1',[email, props]);

		return rows;
	} catch (err){
		return ({error: true, message: err.toString()})
	}
}

async function reRegisterUser(email, password, props){
	try{
		let { rows } = await db.query('update users set (password, props) = ($2, $3) where email = $1',[email, password, props]);

		return rows;
	} catch (err){
		return ({error: true, message: err.toString()})
	}
}
//

//ANNOTATIONS
async function getAnnotations(){
	try {
		let { rows } = await db.query('SELECT * FROM annotations order by number ASC');
		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function getAnnotation(uid){
	try {
		let { rows } = await db.query('SELECT * FROM annotations where uid = $1', [uid]);
		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function getAnnotationsByBooth(boothid){
	try {
		let { rows } = await db.query('SELECT * FROM annotations where boothid = $1', [boothid]);
		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function getAnnotationsSpecificByNumber(boothnumber, annotationnumber){
	try {
		let { rows } = await db.query("SELECT * from annotations where boothid = (select uid from booths where number = $1) and content->>'number' = $2", [boothnumber, annotationnumber]);
		
		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function addAnnotation(uid, boothid, aname, acontent){
	try{
		let { rows } = await db.query('INSERT into annotations(uid, boothid, name, content) values ($1, $2, $3, $4)', [uid, boothid, aname, acontent])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function deleteAnnotation(uid){
	try{
		let { rows } = await db.query('DELETE from annotations WHERE uid = $1', [uid])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function editAnnotation(uid, aname, acontent){
	try {
		let { rows } = await db.query('UPDATE annotations SET (name, content) = ($2, $3) where uid = $1', [uid, aname, acontent])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}
//

//CUSTOM APP QUERIES
//BRIEFCASE
async function getBriefcase(email){
	try {
		let {rows} = await db.query("SELECT props -> 'briefcase' AS briefcase from users where email = $1", [email])

		return rows;
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function addBriefcase(email, briefcase){
	try {
		let parseBriefcase = '["'+ briefcase +'"]';

		let { rows } = await db.query("SELECT props -> 'briefcase' AS briefcase from users where email = $1", [email])

		let findBriefcase = rows[0].briefcase.find(bc => bc == briefcase);
		if(findBriefcase){
			return ({error: true, message: 'Briefcase already exist!'})
		} else {
			let response = await db.query(`UPDATE users SET props=jsonb_set(props, '{briefcase}', (props->'briefcase') || $2) where email = $1`, [email, parseBriefcase])

			return ({error: false, message: 'Add briefcase Succesful!'});
		}		
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

async function deleteBriefcase(email, briefcase){
	try {
		let { rows } = await db.query("UPDATE users SET props=jsonb_set(props, '{briefcase}', (props->'briefcase') - $2) where email = $1", [email, briefcase])
	} catch(err){
		return ({error: true, message: err.toString()})
	}
}

//
//

module.exports = {
	getBooths,
	getBooth,
	addBooth,
	deleteBooth,
	editBooth,
	registerUser,
	getUser,
	getUsersData,
	getAdmin,
	updateUser,
	reRegisterUser,
	getAnnotations,
	getAnnotation,
	getAnnotationsByBooth,
	getAnnotationsSpecificByNumber,
	addAnnotation,
	deleteAnnotation,
	editAnnotation,
	getBriefcase,
	addBriefcase,
	deleteBriefcase
}