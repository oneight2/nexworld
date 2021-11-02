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

		let {email, password, name, company, jobtitle, phone, usertype} = decodedToken;

		let emailCheck = await pgdb.getUser(email);

		if(emailCheck.length > 0) {
			res.redirect(`/message/red/4`);
		} else {
			if(usertype == 'partner'){
<<<<<<< HEAD
				let response = await pgdb.registerUser(uuidv4(), email, password, 'user', {name, company, jobtitle, phone, briefcase: [], usertype: 'partner'});
				
			} else {
				let response = await pgdb.registerUser(uuidv4(), email, password, 'user', {name, company, jobtitle, phone, briefcase: []});
=======
				let response = await pgdb.registerUser(uuidv4(), email.toLowerCase(), password, 'user', {name, company, jobtitle, phone, briefcase: [], usertype: 'partner'});
			} else {
				let response = await pgdb.registerUser(uuidv4(), email.toLowerCase(), password, 'user', {name, company, jobtitle, phone, briefcase: []});
>>>>>>> 6a80a6f8e4022272414fc0b24eff259f5b315ec2
			}

			res.redirect(`/message/green/2`);
		}
		/*res.send({error: false, message: 'Verification Successful!'});*/
	} catch(err){
		res.status(403).send({error: true, message: err.toString()});
	}
})

module.exports = router;