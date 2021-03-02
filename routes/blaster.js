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

//REGISTER, SEND TOKEN LINK TO EMAIL

function parseMeetingInfo(mi){
    switch(mi){
    	case '6mar21-1000':
    	return {meetingid: '81377875643', meetingpass: 'hasummit21', code: '1', date: '6 Maret 2021 - 10.00', poster: 'http://virtualfest.id/nutricia/email/poster-simposium-1.jpg'};
    	break;
    	case '7mar21-1000':
    	return {meetingid: '85811709809', meetingpass: 'hasummit21', code: '1', date: '7 Maret 2021 - 10.00', poster: 'http://virtualfest.id/nutricia/email/poster-simposium-3.jpg'};
    	break;
    	case '6mar21-1300':
    	return {meetingid: '88341341245', meetingpass: 'hasummit21', code: '2', date: '6 Maret 2021 - 13.00', poster: 'http://virtualfest.id/nutricia/email/poster-simposium-2.jpg'};
    	break;
    	case '7mar21-1300':
    	return {meetingid: '81091976781', meetingpass: 'hasummit21', code: '2', date: '7 Maret 2021 - 13.00', poster: 'http://virtualfest.id/nutricia/email/poster-simposium-4.jpg'};
    	break;
    }
}

//Registration api, params: body: {user, props}
router.post('/generateReminders', async (req,res) => {

	function sendReminderEmail(email, name, meetinginfo){
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
		    templateId: 2,
		    params: {
		        meetingid: meetinginfo.meetingid,
		        meetingpass: meetinginfo.meetingpass,
		        meetingcode: meetinginfo.code,
		        meetingdate: meetinginfo.date,
		        meetingposter: meetinginfo.poster
		    },
		    headers: {
		        'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
		    }
		};

		apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
		  console.log({status: 'OK', message: 'API called successfully. Returned data: ' + data});
		}, function(error) {
		  console.log({error: true, message: error});
		});
	}

	try{
		let userData = await pgdb.getUsersData();

		for(i=0; i<userData.length; i++){
			let userEmail = userData[i].email;
			let userSympossium = userData[i].props.sympossium;

			for(j=0; j<userSympossium.length; j++){
				let currentSympossDate = userSympossium[j];
				let dateIndex = currentSympossDate.indexOf('-');
				let parsedDate = currentSympossDate.slice(0, dateIndex);
				if (parsedDate == req.body.forsymposs){
					console.log({parsedDate, bodySymposs: req.body.forsymposs})
					sendReminderEmail(userEmail, userEmail, parseMeetingInfo(currentSympossDate));
				}
			}

		}
			
		res.send('Email blast successfully sent.');
	} catch(err){
		res.status(500).send({error: true, message: err.toString()});
	}
})

//

module.exports = router;