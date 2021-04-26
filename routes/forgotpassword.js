const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

router.get('/', (req, res) => {
    res.render('forgotpassword.ejs', {
        layout: 'layouts/bootstraplayout'
    })
})

router.post('/resend', async (req, res) => {

    function resendTokenEmail(email, name, token) {
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
            templateId: 6,
            params: {
                token
            },
            headers: {
                'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
            }
        };

        apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
            return ('Registration Successful: ' + email)
        }, function(error) {
            return error
        });
    }

    try {
    	let userInfo = await pgdb.getUser(req.body.email);

        if (userInfo[0].name == req.body.name && userInfo[0].phone === req.body.phone) {
            res.send({ error: true, message: 'The information you filled are incorrect.' })
        } else {
            let newToken = uuidv4();
            let salt = await bcrypt.genSalt(saltRounds);
            let hash = await bcrypt.hash(newToken, salt);

            let changeTokenResponse = await pgdb.changePassword(req.body.email, hash);

            let emailResponse = await resendTokenEmail(req.body.email, req.body.name, newToken);

            if(changeTokenResponse.error){
            	throw new Error(changeTokenResponse.message);
            }

            res.send({
                error: false,
                user: req.body.email,
                newToken
            });
        }
    } catch (err) {
        res.status(500).send({ error: true, message: err.toString() });
    }
})

module.exports = router;