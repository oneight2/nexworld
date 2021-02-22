const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');

const bcrypt = require('bcrypt');

router.get('/', function (req, res) {
  res.send('Get Admin');
})

router.post('/getData', async (req, res) => {
  try {
  		let adminResponse = await pgdb.getAdmin();

  		let adminUser = adminResponse[0].email;
  		let adminPassword = adminResponse[0].password;

  		let userMatch = req.body.user == adminUser;
  		let passwordMatch = await bcrypt.compare(req.body.password, adminPassword);
  		
  		if(passwordMatch && userMatch){
  			let response = await pgdb.getUsersData();

	  		res.send(response);
  		} else {
  			res.status(500).send({error: true, message: 'Wrong username or password'})
  		}
	} catch (err){
		res.status(500).send({error: true, message: err.toString()});
	}
})

module.exports = router;