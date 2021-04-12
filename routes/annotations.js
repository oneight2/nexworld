const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');
const multer  = require('multer');
const fs = require('fs');
const mediaPath = 'uploads/';
const shortid = require('shortid');

//MIDDLEWARE//
const authMw = require('../middleware/authToken')

const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },	
  filename: function (req, file, cb) {
  	if(req.body.contentType == 'slider'){
  		cb(null, req.body.boothid + '-' + req.body.number + '-' + shortid.generate() + path.extname(file.originalname))
  	} else {
  		cb(null, req.body.boothid + '-' + req.body.number + path.extname(file.originalname))
  	}
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
router.post('/add', [authMw.authToken({permissions: ['admin']}), upload.array('content')], async (req, res) => {
	try{
		let content = {};
		let contentFile;

		switch(req.body.contentType){
			case 'singlefile':
			contentFile = req.files[0];
			content = {
				number: req.body.number,
				filename: contentFile.filename,
				type: contentFile.mimetype
			}
			break;

			case 'slider':
			contentFile = req.files;
			let contentNames = [];
			for (i=0;i<contentFile.length;i++){
				contentNames.push(contentFile[i].filename)
			}
			content = {
				number: req.body.number,
				filename: contentNames,
				type: 'slider'
			}
			break;

			case 'exurl':
			content = {
				number: req.body.number,
				filename: req.body.content,
				type: 'external_url'
			}
			break;
			case 'feedbackform':
			content = {
				number: req.body.number,
				filename: 'Feedback Form',
				type: 'feedbackform'
			}
			break;
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
		let annData = await pgdb.getAnnotation(req.body.uid);
		let annContent = annData[0].content;
		let files = annContent.filename;
		console.log(annContent.type)
		switch(annContent.type){
			case 'slider':
				for(i=0;i<files.length;i++){
					fs.unlinkSync(mediaPath + files[i]);
				}
			break;
			case 'external_url':
			case 'feedbackform':
			break;
			default:
				fs.unlinkSync(mediaPath + annContent.filename);
			break;
		}

		let response = await pgdb.deleteAnnotation(req.body.uid);
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
