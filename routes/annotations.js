const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');
const multer  = require('multer');
const fs = require('fs');
const mediaPath = 'uploads/';

//MIDDLEWARE//
const authMw = require('../middleware/authToken')

const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },	
  filename: function (req, file, cb) {
    cb(null, req.body.boothid + '-' + req.body.number + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage})
//Get all annotations
router.get('/get', async (req, res) => {
	let response = await pgdb.getAnnotations();
	
	res.send(response);
})

//Add a annotations 
//Requires a request body (annotations uid, booth relations uid, annotation name, annotation content(JSON) as JSON)
router.post('/add', [authMw.authToken({permissions: ['admin']}), upload.single('content')], async (req, res) => {
	try{
		let content = {
			number: req.body.number,
			filename: req.file.filename,
			type: req.file.mimetype
		}
		let response = await pgdb.addAnnotation(uuidv4(), req.body.boothid, req.body.name, JSON.stringify(content));
		res.send({status: 'Success', message: 'Add Annotation Success!'})
	} catch (err){
		res.send({status: 'Error', message: err.toString()});
	}
})

//Delete a annotations
//Requires a request body (uid)
router.delete('/delete', authMw.authToken({permissions: ['admin']}), async (req, res) => {
	try {
		let response = await pgdb.deleteAnnotation(req.body.uid);
		fs.unlinkSync(mediaPath + req.body.filename);
		res.send({status: 'Success', message: 'Delete Annotation Success!'});
	} catch(err){
		res.send({status: 'Error', message: err.toString()});
	}
})

//Update a annotations
//Requires a request body (booth uid, annotation name, annotation content(JSON) as JSON)
router.put('/edit', async (req, res) => {
	let response = await pgdb.editAnnotation(req.body.uid, req.body.name, req.body.content);

	res.send(response);
})

module.exports = router;
