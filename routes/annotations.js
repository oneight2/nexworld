const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');

//Get all booths
router.get('/get', async (req, res) => {
	let response = await pgdb.getAnnotations();
	
	res.send(response);
})

//Add a booth 
//Requires a request body (booth number, booth name, booth annotations as JSON)
router.post('/add', async (req, res) => {
	let response = await pgdb.addAnnotation(req.body.uid, req.body.name, req.body.content);
	
	res.send(response);
})

//Delete a booth
//Requires a request body (uid)
router.delete('/delete', async (req, res) => {
	let response = await pgdb.deleteAnnotation(req.body.uid);

	res.send(response);
})

//Update a booth
//Requires a request body (booth uid, booth number, booth name, booth annotations as JSON)
router.put('/edit', async (req, res) => {
	let response = await pgdb.editAnnotation(req.body.uid, req.body.name, req.body.content);

	res.send(response);
})

module.exports = router;
