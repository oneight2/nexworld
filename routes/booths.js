const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');

//MIDDLEWARE//
const authMw = require('../middleware/authToken')

//Get all booths
router.get('/get', async (req, res) => {
	let response = await pgdb.getBooths();
	
	res.send(response);
})

//Add a booth 
//Requires a request body (booth number, booth name, booth annotations as JSON)
router.post('/add', authMw.authToken({permissions: ['admin']}), async (req, res) => {
	try{
		let response = await pgdb.addBooth(uuidv4(), req.body.number, req.body.name);
		
		res.send({status: 'Success', message: 'Add Booth Success!'});
	} catch(err){
		res.send({status: 'Error', message: err.toString()})
	}
})

//Delete a booth
//Requires a request body (uid)
router.delete('/delete', authMw.authToken({permissions: ['admin']}), async (req, res) => {
	let response = await pgdb.deleteBooth(req.body.uid);

	res.send(response);
})

//Update a booth
//Requires a request body (booth uid, booth number, booth name, booth annotations as JSON)
router.put('/edit', async (req, res) => {
	let response = await pgdb.editBooth(req.body.uid, req.body.number, req.body.name);

	res.send(response);
})

module.exports = router;