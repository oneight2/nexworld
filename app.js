const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

const pgdb = require('./db/pg');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');

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

const cors = require('cors')
app.use(cors())

const { v4: uuidv4 } = require('uuid');

app.use("/", express.static(__dirname + '/views'));
app.engine('html', require('ejs').renderFile);

app.set('views');
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/defaultlayout');

//MIDDLEWARE//

function authToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if(token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if(err){
			res.status(403).send(err.toString());
		}
		req.user = user;
		next()
	})
}

//ROUTES//

app.get('/', function (req, res) {
  res.render('index')
})

//Auth
app.post('/auth', authToken, (req, res)=>{
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

app.use('/booths', authToken, booths);
//

//Annotations
const annotations = require('./routes/annotations')

app.use('/annotations', authToken, annotations);
//

//Admin
const admin = require('./routes/admin')

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