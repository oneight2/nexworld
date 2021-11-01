var express = require("express");
var router = express.Router();
const { getBooths } = require("./controller");

router.get("/getBooths", getBooths);

module.exports = router;
