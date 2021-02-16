const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/autoGenerateByEmail', async (req,res) => {
	try{
		let userToken = 'token-'+uuidv4();
		let salt = await bcrypt.genSalt(saltRounds);
		let hash = await bcrypt.hash(userToken, salt);
		let response = await pgdb.registerUser(uuidv4(), req.body.user, hash, 'user');

	    res.send({
	    	user: req.body.user,
	    	userToken: userToken
	    });
	} catch(err){
		res.status(500).send(err.toString());
	}
})

module.exports = router;