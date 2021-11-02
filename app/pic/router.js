var express = require("express");
var router = express.Router();
const {
  getPics,
  getPic,
  addPic,
  updatePic,
  deletePic,
} = require("./controller");

router.get("/getPics", getPics);
router.get("/getPic/:id", getPic);
router.post("/addPic", addPic);
router.put("/updatePic/:id", updatePic);
router.delete("/deletePic/:id", deletePic);

module.exports = router;
