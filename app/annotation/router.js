var express = require("express");
var router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  getAnnotations,
  getAnnotation,
  getAnnotationByBooth,
} = require("./controller");

router.get("/getAnnotations", getAnnotations);
router.get("/getAnnotation/:id", getAnnotation);
router.get("/getAnnotations/:boothid", getAnnotationByBooth);

module.exports = router;
