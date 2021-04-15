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

	function sendLinkEmail(email, name, userjwt, token){
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
		        email: email,
		        name: name
		    }],
		    templateId: 1,
		    params: {
		        activationlink: process.env.FRONTEND_ADDRESS + '/activation/email/' + userjwt,
		        token: token
		    },
		    headers: {
		        'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
		    }
		};

		apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
			console.log(email)
		  return ('Registration Successful: ' + email)
		}, function(error) {
			console.log(error)
		  return error
		});
	}

	try{
		if (validator.isEmail(req.body.email) == false){
			res.status(500).send({error: true, message: 'Email format is incorrect.'})
		}
	    let userCheck = await pgdb.getUser(req.body.email);

		if(userCheck.length > 0){
			res.send({error: true, message: 'The email you are using has already registered.'})
		} else {
			let userToken = uuidv4();
			let salt = await bcrypt.genSalt(saltRounds);
			let hash = await bcrypt.hash(userToken, salt);

			let jwtToken =  await jwt.sign({
				email: req.body.email, 
				password: hash, 
				name: req.body.name,
				company: req.body.company,
				jobtitle: req.body.jobtitle, 
				phone: req.body.phone
			}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
			let emailResponse = await sendLinkEmail(req.body.email, req.body.name, jwtToken, userToken);
		    res.send({
		    	error:false,
		    	user: req.body.email,
		    	userToken: userToken,
		    	jwt: jwtToken
		    });
		}
	} catch(err){
		res.status(500).send({error: true, message: err.toString()});
	}
})

/*
//REGISTER, SEND TOKEN LINK TO EMAIL

function parseMeetingInfo(mi){
    switch(mi){
    	case '6mar21-1000':
    	return {meetingid: '81377875643', meetingpass: 'hasummit21', code: '1', date: '6 Maret 2021 - 10.00'};
    	break;
    	case '7mar21-1000':
    	return {meetingid: '85811709809', meetingpass: 'hasummit21', code: '1', date: '7 Maret 2021 - 10.00'};
    	break;
    	case '6mar21-1300':
    	return {meetingid: '88341341245', meetingpass: 'hasummit21', code: '2', date: '6 Maret 2021 - 13.00'};
    	break;
    	case '7mar21-1300':
    	return {meetingid: '81091976781', meetingpass: 'hasummit21', code: '2', date: '7 Maret 2021 - 13.00'};
    	break;
    }
}

//Registration api, params: body: {user, props}
router.post('/autoGenerateByEmail', async (req,res) => {

	function sendLinkEmail(email, name, token, meetinginfo){
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
		        email: email,
		        name: name
		    }],
		    templateId: 1,
		    params: {
		        loginlink: process.env.FRONTEND_ADDRESS + '/login?user=' + email + '&token=' + token,
		        meetingid: meetinginfo.meetingid,
		        meetingpass: meetinginfo.meetingpass,
		        meetingcode: meetinginfo.code,
		        meetingdate: meetinginfo.date
		    },
		    headers: {
		        'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
		    }
		};

		apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
		  console.log({status: 'OK', message: 'Registration Successful ', email});
		}, function(error) {
		  console.log({error: true, message: error});
		});
	}

	try{
		let userCheck = await pgdb.getUser(req.body.user);
		
		if(userCheck.length > 0){
			let userToken = 'token-'+uuidv4();
			let salt = await bcrypt.genSalt(saltRounds);
			let hash = await bcrypt.hash(userToken, salt);

			let response = await pgdb.reRegisterUser(req.body.user, hash, req.body.props);

			let symData = req.body.props.sympossium;
			for(i=0; i<symData.length; i++){
				sendLinkEmail(req.body.user, req.body.props.name, userToken, parseMeetingInfo(symData[i]));
			}
			res.send({
				user: req.body.user,
				userToken: userToken
			})
		} else {
			let userToken = 'token-'+uuidv4();
			let salt = await bcrypt.genSalt(saltRounds);
			let hash = await bcrypt.hash(userToken, salt);

			let response = await pgdb.registerUser(uuidv4(), req.body.user, hash, 'user', req.body.props);

			let symData = req.body.props.sympossium;
			for(i=0; i<symData.length; i++){
				sendLinkEmail(req.body.user, req.body.props.name, userToken, parseMeetingInfo(symData[i]));
			}
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
*/
module.exports = router;