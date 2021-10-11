const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pgdb = require('../db/pg');

const bcrypt = require('bcrypt');

//MIDDLEWARE//
const authMw = require('../middleware/authToken')

function parsemessage(code){
  switch(code){
    case '1':
    return 'Delete successful!'
    break;
    case '2':
    return 'Add successful!'
    break;
  }
}

router.get('/', function (req, res) {
  res.send('Get Admin');
})

router.post('/', authMw.authToken({permissions: ['admin']}), async (req,res)=>{
  try{
    res.send({status: 'Success', message: 'Authorized'});
  } catch(err){
    res.send({status: 'Error', message: 'Unauthorized'})
  }
})

router.get('/dashboard', async (req, res) => {
  try {
    res.render('admin_dashboard', {
      title: 'Synnex Admin', 
      layout: 'layouts/adminsidenav'
    });
  } catch(err){
    res.send(err.toString());
  }  
})

router.get('/booths', async (req, res) => {
  try {
    let booths = await pgdb.getBooths();

    res.render('admin_booths', {
      title: 'Synnex Admin', 
      layout: 'layouts/adminsidenav',
      booths: booths,
      message: req.query.message ? parsemessage(req.query.message) : null
    });
  } catch(err){
    res.send(err.toString());
  }  
})

router.get('/addbooths', async (req, res) => {
  try {
    let booths = await pgdb.getBooths();

    res.render('admin_addbooth', {
      title: 'Synnex Admin', 
      layout: 'layouts/adminsidenav',
      message: req.query.message ? parsemessage(req.query.message) : null
    });
  } catch(err){
    res.send(err.toString());
  }  
})

router.get('/annotations_selectbooth', async (req, res) => {
  try{
    let booths = await pgdb.getBooths();

    res.render('admin_selectbooth', {
      title: 'Synnex Admin - Annotations', 
      layout: 'layouts/adminsidenav', 
      extractScripts: true,
      booths: booths
    });
  } catch(err){
    res.send(err.toString());
  }
})

router.post('/annotations_selectbooth', (req, res) => {
  res.redirect('/admin/annotations?boothid='+req.body.boothid);
})

router.get('/annotations', async (req, res) => {
  try{
    let annotations = await pgdb.getAnnotationsByBooth(req.query.boothid);

    let booth = await pgdb.getBooth(req.query.boothid);
    let boothId = booth[0].uid;
    let boothName = booth[0].name;

    res.render('admin_annotations', {
      title: 'Synnex Admin - Annotations', 
      layout: 'layouts/adminsidenav', 
      extractScripts: true,
      annotations: annotations,
      boothId: boothId,
      boothName: boothName,
      message: req.query.message ? parsemessage(req.query.message) : null
    });
  } catch(err){
    res.send(err.toString());
  }
})

router.get('/addannotations', async (req, res) => {
  try{
    let booths = await pgdb.getBooths();

    res.render('admin_addannotations', {
      title: 'Synnex Admin - Annotations', 
      layout: 'layouts/adminsidenav', 
      extractScripts: true,
      boothData: booths
    });
  } catch(err){
    res.send(err.toString());
  }
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