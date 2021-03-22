const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

const pgdb = require('./db/pg');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hostname = '127.0.0.1';
const port = process.env.APP_PORT;

const pg = require('pg')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session);

const bodyParser = require('body-parser');
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

/*
const cors = require('cors')
app.use(cors())
*/

const { v4: uuidv4 } = require('uuid');

app.use("/", express.static(__dirname + '/views'));
app.engine('html', require('ejs').renderFile);

app.set('views');
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/defaultlayout');
app.set("layout extractScripts", true)

//MIDDLEWARE//
const authMw = require('./middleware/authToken')

//ROUTES//

app.get('/', function (req, res) {
  res.render('index')
})

//Auth
app.post('/auth', authMw.authToken, (req, res)=>{
  if(req.user.email != req.body.user){
    res.status(403).send({error: true, message: 'Wrong token'})
  }

  res.send({
    status: 'Authorized', 
    user: req.user
  });
})
//

//Login function
const login = require('./routes/login')

app.use('/login', login);

app.post('/logout', async(req,res)=> {
	res.send('Logout') 
})
//

//Login function
const register = require('./routes/register')

app.use('/register', register);

//

//BOOTHS
const booths = require('./routes/booths')

app.use('/booths', booths);
//

//Annotations
const annotations = require('./routes/annotations')

app.use('/annotations', annotations);
//

//Admin
function adminparsemessage(code){
  switch(code){
    case '1':
    return 'Wrong account or password'
    break;
    case '2':
    return 'Your session has expired, please re-login.'
    break;
  }
}

const admin = require('./routes/admin')
app.get('/adminlogin', (req, res) => {
  res.render('adminlogin', {layout: 'layouts/emptylayout', message: adminparsemessage(req.query.message)});
})

app.post('/adminlogin', async (req, res) => {
  try{
    let response = await pgdb.getAdmin();

    let adminData = response[0];
    let match = await bcrypt.compare(req.body.password, adminData.password)
    if(req.body.email == adminData.email && match){
      const user = { email: adminData.email , devicetoken: uuidv4(), role: adminData.role}

      const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' })

      res.render('loginform', {
        userkey: 'synnex-admin',
        user: adminData.email,
        jwt: jwtToken,
        redirecturl: '/admin/dashboard',
        layout: 'layouts/emptylayout'
      })
    } else {
      res.redirect('/adminlogin?message=1')
    }
  } catch(err){
    res.send(err.toString())
  }
})

app.use('/admin', admin);
//

//Activations
const activation = require('./routes/activation');

app.use('/activation', activation);
//

//Blast reminder email
const blaster = require('./routes/blaster')

app.use('/blaster', blaster);
//
 
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});