var express = require("express");
var router = express.Router();
const {
  getBooths,
  getBooth,
  addBooth,
  updateBooth,
  deleteBooth,
} = require("./controller");

router.get("/getBooths", getBooths);
router.get("/getBooth/:id", getBooth);
router.post("/addBooth", addBooth);
router.put("/updateBooth/:id", updateBooth);
router.delete("/deleteBooth/:id", deleteBooth);

module.exports = router;
