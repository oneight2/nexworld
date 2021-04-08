const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', function (req, res) {
  res.send('Get Login');
})

router.post('/', async (req, res) => {
  try {

  		if (validator.isEmail(req.body.email)){//EMAIL VALIDATION

  			let response = await pgdb.getUser(req.body.email);

  			if(response.length == 0) {
				res.status(500).send({error: true, message: 'Your account does not exist or it has not verified yet.'})  				
  			}

			let dbpassword = response[0].password;

			let match = await bcrypt.compare(req.body.password, dbpassword)
			if (match){
				const user = { email: req.body.email , devicetoken: uuidv4(), role: response[0].role}

				const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })

				res.render('loginform', {
					userkey: 'synnex',
					user: req.body.email,
					jwt: jwtToken,
					redirecturl: '/virtual',
					layout: 'layouts/emptylayout'
				})
				//res.send({ jwtToken })
			} else {
				res.status(500).send({error: true, message: 'Wrong username or password'})
			}

  		} else {
  			res.status(500).send({error:true, message: 'Wrong email format'})
  		}
	} catch (err){
		res.status(500).send({error: true, message: err.toString()});
	}
})

router.post('/admin', async (req, res) => {
  try {

  		if (validator.isEmail(req.body.user)){//EMAIL VALIDATION

  			let response = await pgdb.getAdmin();
			let dbpassword = response[0].password

			let match = await bcrypt.compare(req.body.password, dbpassword)
			if (match){
				const user = { email: req.body.user , devicetoken: uuidv4()}

				const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })

				res.send({ jwtToken })
			} else {
				res.status(500).send({error: true, message: 'Wrong username or password'})
			}

  		} else {
  			res.status(500).send({error:true, message: 'Wrong email format'})
  		}
	} catch (err){
		res.status(500).send({error: true, message: err.toString()});
	}
})

module.exports = router;