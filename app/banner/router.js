var express = require("express");
var router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  getBanners,
  getBanner,
  addBanner,
  updateBanner,
  deleteBanner,
  search,
} = require("./controller");

router.get("/", search);
router.get("/getBanners", getBanners);
router.get("/getBanner/:id", getBanner);
router.post(
  "/addBanner",
  multer({ dest: os.tmpdir() }).single("image"),
  addBanner
);
router.put(
  "/updateBanner/:id",
  multer({ dest: os.tmpdir() }).single("image"),
  updateBanner
);
router.delete("/deleteBanner/:id", deleteBanner);

module.exports = router;
