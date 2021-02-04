const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');
const validator = require('validator');

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', function (req, res) {
  res.send('Get Login');
})

router.post('/', async (req, res) => {
  try {

  		if (validator.isEmail(req.body.user)){//EMAIL VALIDATION

  			let response = await pgdb.getUser(req.body.user);
			let dbpassword = response[0].password

			let match = await bcrypt.compare(req.body.password, dbpassword)
			if (match){
				req.session.user = req.body.user;
				req.session.token = uuidv4();

				res.send('Login success')
			} else {
				res.send('Wrong username or password')
			}

  		} else {
  			res.send('Wrong email format')
  		}
	} catch (err){
		res.send(err.toString());
	}
})

router.get('/register', async (req,res) => {
	try{
		let salt = await bcrypt.genSalt(saltRounds);
		let hash = await bcrypt.hash('abcdef1234', salt);
		let response = await pgdb.registerUser(uuidv4(), 'nyoman@gmail.com', hash, 'user');

	    res.send(response);
	} catch(err){
		res.send(err.toString());
	}
})

router.get('/check', async(req,res)=> {
	res.send({user: req.session.user, token: req.session.token});
})

module.exports = router;