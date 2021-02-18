const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

router.post('/default', async (req, res)=> {
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


//REGISTER, SEND TOKEN LINK TO EMAIL

//Registration api, params: body: {user, props}
router.post('/autoGenerateByEmail', async (req,res) => {

	function sendLinkEmail(email, token){
		// Configure API key authorization: api-key
		var apiKey = defaultClient.authentications['api-key'];
		apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

		// Uncomment below two lines to configure authorization using: partner-key
		// var partnerKey = defaultClient.authentications['partner-key'];
		// partnerKey.apiKey = 'YOUR API KEY';

		var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

		var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

		sendSmtpEmail = {
		    to: [{
		        email: 'a.pranasakti@gmail.com',
		        name: 'Arie'
		    }],
		    templateId: 1,
		    params: {
		        loginlink: process.env.FRONTEND_ADDRESS + '/login?user=' + email + '&token=' + token
		    },
		    headers: {
		        'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
		    }
		};

		apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
		  res.send({status: 'OK', message: 'API called successfully. Returned data: ' + data});
		}, function(error) {
		  res.status(500).send({error: true, message: error});
		});
	}

	try{
		let userCheck = await pgdb.getUser(req.body.user);
		
		if(userCheck.length > 0){
			let userToken = 'token-'+uuidv4();
			let salt = await bcrypt.genSalt(saltRounds);
			let hash = await bcrypt.hash(userToken, salt);

			let response = await pgdb.reRegisterUser(req.body.user, hash, req.body.props);

			sendLinkEmail(req.body.user, userToken);
			res.send({
				user: req.body.user,
				userToken: userToken
			})
		} else {
			let userToken = 'token-'+uuidv4();
			let salt = await bcrypt.genSalt(saltRounds);
			let hash = await bcrypt.hash(userToken, salt);

			let response = await pgdb.registerUser(uuidv4(), req.body.user, hash, 'user', req.body.props);

			sendLinkEmail(req.body.user, userToken);
			res.send({
		    	user: req.body.user,
		    	userToken: userToken
		    });
		}
	} catch(err){
		res.status(500).send({error: true, message: err.toString()});
	}
})

//

module.exports = router;