const express = require('express');
const router = express.Router();
const pgdb = require('../db/pg');

//MIDDLEWARE//
const authMw = require('../middleware/authToken')

//Routes
router.get('/', async (req, res) => {
	res.render('virtual', {
      title: 'Synnex Virtual', 
      layout: 'layouts/virtuallayout'
    });
})

router.post('/getbriefcase', async(req, res) => {
	try {
		let response = await pgdb.getBriefcase(req.body.email);

		res.send(response);
	} catch(err){
		res.send({error: true, message: err.toString()})
	}
})

router.post('/briefcase', async(req, res) => {
	try {
		let response = await pgdb.addBriefcase(req.body.email, '["'+ req.body.briefcase +'"]');

		res.send(response);
	} catch(err){
		res.send({error: true, message: err.toString()})
	}
}) 


module.exports = router;
