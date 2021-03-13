const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');
const jwt = require('jsonwebtoken');

//Get all booths
router.get('/email/:token', async (req, res) => {
	try {
		let token = req.params.token;
		let decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

		let {email, password, name, occupation, phone} = decodedToken;

		let emailCheck = await pgdb.getUser(email);

		if(emailCheck.length > 0) {
			res.send('Email already verified');
		}

		let response = await pgdb.registerUser(uuidv4(), email, password, 'user', {name, occupation, phone});

		res.send('Verification Successful!');
	} catch(err){
		res.status(403).send(err.toString());
	}
})

module.exports = router;