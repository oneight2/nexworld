const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const path = require('path')

const pgdb = require('./db/pg');
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const hostname = '0.0.0.0';
const port = process.env.APP_PORT;

const pg = require('pg'),
    session = require('express-session'),
    pgSession = require('connect-pg-simple')(session);

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

app.get('/', function(req, res) {
    res.render('index')
})

//Auth
app.post('/auth', authMw.authToken, (req, res) => {
    if (req.user.email != req.body.user) {
        res.status(403).send({ error: true, message: 'Wrong token' })
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

app.post('/logout', async (req, res) => {
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
function adminparsemessage(code) {
    switch (code) {
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
    res.render('adminlogin', { layout: 'layouts/emptylayout', message: adminparsemessage(req.query.message) });
})

app.post('/adminlogin', async (req, res) => {
    try {
        let response = await pgdb.getAdmin();

        let adminData = response[0];
        let match = await bcrypt.compare(req.body.password, adminData.password)
        if (req.body.email == adminData.email && match) {
            const user = { email: adminData.email, devicetoken: uuidv4(), role: adminData.role }

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
    } catch (err) {
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

//VIRTUAL PAGES
const virtual = require('./routes/virtual')

app.use('/virtual', virtual)
//

//Message Page
app.get('/message/:color/:message', (req, res) => {
    res.render('message.ejs', {
        color: req.params.color,
        message: req.params.message,
        layout: 'layouts/bootstraplayout'
    })
})
//

//Forgot Password Pages
const forgotpassword = require('./routes/forgotpassword')

app.use('/forgotpassword', forgotpassword)
//

//INSERT DATA JOB
const csv = require('csv-parser');

const validator = require('validator');
const fs = require('fs');

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

app.get('/sendDataBulk', (req, res) => {
    function sendTokenEmail(email, name, userjwt, token) {
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

    fs.createReadStream('data.csv')
        .pipe(csv())
        .on('data', async (row) => {
            try {
                let userToken = row.PASSWORD;
                let salt = await bcrypt.genSalt(saltRounds);
                let hash = await bcrypt.hash(userToken, salt);
                let jwtToken = await jwt.sign({
                    email: row.EMAIL,
                    password: row.PASSWORD,
                    name: row.NAME,
                    company: row.COMPANY,
                    jobtitle: row.JOBTITLE,
                    phone: row.PHONE
                }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d' });
                let emailResponse = await sendTokenEmail(row.EMAIL, row.NAME, jwtToken, userToken);
                console.log({
                    error: false,
                    user: row.EMAIL,
                    userToken: userToken,
                    jwt: jwtToken
                });
                
            } catch (err) {
                console.log(err)
            }

        })
        .on('end', () => {
            console.log('CSV file successfully processed');
        });
    res.send({ error: false, message: 'CSV file successfully processed' })
})

//

//MEDIA FILES PATHS
app.get('/uploads/:file', (req, res) => {
    res.sendFile(path.join(__dirname, './uploads', req.params.file))
})
//

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});