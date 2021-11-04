const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const pgdb = require("../db/pg");
const db = require("../db/db");
const validator = require("validator");
const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
router.get("/dashFacebook", isLoggedIn, async (req, res) => {
  try {
    //EMAIL VALIDATION
    let email = req.user.email;
    let props = { name: req.user.displayName };
    let uid = uuidv4();
    let register_date = new Date();
    let role = "user";
    let userkey = "synnex";

    let response = await pgdb.getUser(email);

    res.send({
      email,
      props,
      uid,
      register_date,
      role,
      userkey,
      response,
    });

    // if (response.length == 0) {
    //   await db.query(
    //     `INSERT into users (uid, email, role, props, register_date) values ($1, $2, $3, $4, $5)`,
    //     [uid, email, role, props, register_date]
    //   );
    //   const user = {
    //     email: email,
    //     devicetoken: uuidv4(),
    //     role: "user",
    //   };

    //   const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "30d",
    //   });
    //   res.render("loginform", {
    //     userkey: "synnex",
    //     user: email,
    //     userid: uid,
    //     jwt: jwtToken,
    //     redirecturl: "/virtual",
    //   });
    // } else {
    //   const user = {
    //     email: email,
    //     devicetoken: uuidv4(),
    //     role: "user",
    //   };

    //   const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "30d",
    //   });
    //   res.render("loginform", {
    //     userkey: "synnex",
    //     user: email,
    //     userid: uid,
    //     jwt: jwtToken,
    //     redirecturl: "/virtual",
    //   });
    // }

    // let dbpassword = response[0].password;

    // let userid = response[0].uid;

    // let match = await bcrypt.compare(req.body.password, dbpassword);
    // if (match) {
    //   const user = {
    //     userid,
    //     email: req.body.email,
    //     devicetoken: uuidv4(),
    //     role: response[0].role,
    //   };

    //   const jwtToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: "30d",
    //   });

    //   res.send({
    //     error: false,
    //     content: {
    //       userkey: "synnex",
    //       user: req.body.email,
    //       userid,
    //       jwt: jwtToken,
    //       redirecturl: "/virtual",
    //     },
    //   });
    // } else {
    //   res
    //     .status(500)
    //     .send({ error: true, message: "Wrong username or password" });
    // }
  } catch (err) {
    res.status(500).send({ error: true, message: err.toString() });
  }
});
module.exports = router;
