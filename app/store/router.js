var express = require("express");
var router = express.Router();
const multer = require("multer");
const os = require("os");
const {
  getStores,
  getStore,
  addStore,
  updateStore,
  deleteStore,
} = require("./controller");

router.get("/getStores", getStores);
router.get("/getStore/:id", getStore);
router.post(
  "/addStore",
  multer({ dest: os.tmpdir() }).single("image"),
  addStore
);
router.put(
  "/updateStore/:id",
  multer({ dest: os.tmpdir() }).single("image"),
  updateStore
);
router.delete("/deleteStore/:id", deleteStore);

module.exports = router;
