const express = require('express');
const router = express.Router();
const pgdb = require('../db/pg');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

//MIDDLEWARE//
const authMw = require('../middleware/authToken')

//Routes
router.get('/', async (req, res) => {
    res.render('virtual', {
        title: 'Synnex Virtual',
        layout: 'layouts/virtuallayout',
        fileAddr: process.env.DIR
    });
})

router.post('/getbriefcase', authMw.authToken(), async (req, res) => {
    try {
        let response = await pgdb.getBriefcase(req.body.email);

        res.send(response);
    } catch (err) {
        res.send({ error: true, message: err.toString() })
    }
})

router.post('/briefcase', authMw.authToken(), async (req, res) => {
    try {
        let response = await pgdb.addBriefcase(req.body.email, { file: req.body.briefcase, name: req.body.name });

        res.send(response);
    } catch (err) {
        res.send({ error: true, message: err.toString() })
    }
})

router.get('/getAnnotation/:booth/:annotation', authMw.authToken(), async (req, res) => {
    try {
        let response = await pgdb.getAnnotationsSpecificByNumber(req.params.booth, req.params.annotation);

        res.send(response);
    } catch (err) {
        res.send({ error: true, message: err.toString() })
    }
})

router.post('/sessions', authMw.authToken(), async (req, res) => {
    try {
        let response = await pgdb.getUser(req.user.email);
        if (response.length <= 0) {
            res.send({ status: 'Error', message: 'Unauthorized' })
        }

        res.send({ status: 'Success', message: 'Authorized' });
    } catch (err) {
        res.send({ status: 'Error', message: 'Unauthorized' })
    }
})

function sendFeedbackEmail(content) {
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
            email: 'nexworld@metrodata.co.id',
            name: 'Nexworld Metrodata'
        }],
        templateId: 2,
        params: {
        	email: content.email,
        	name: content.name,
        	phone: content.phone,
        	company: content.company,
        	city: content.city,
        	message: content.message,
        	booth: content.booth
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

router.post('/feedback', async (req, res) => {
    try {
    	let userData = await pgdb.getUser(req.body.email);
    	let boothInfo = await pgdb.getBooth(req.body.boothid);

    	let email = userData[0].email;
    	let name = userData[0].props.name;
    	let phone = userData[0].props.phone;
    	let company = req.body.company;
    	let city = req.body.city;
    	let message = req.body.message;
    	let booth = boothInfo[0].name;

    	let dataContent = {
    		email,
    		name,
    		phone,
    		company,
    		city,
    		message,
    		booth
    	}

    	sendFeedbackEmail(email, dataContent);

        res.send({ error: false, message: 'Feedback sent!' })
    } catch (err) {
        res.status(500).send({ error: true, message: err.toString() });
    }
})

module.exports = router;