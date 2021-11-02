var express = require("express");
var router = express.Router();
const {
  getPartners,
  getPartner,
  addPartner,
  updatePartner,
  deletePartner,
} = require("./controller");

router.get("/getPartners", getPartners);
router.get("/getPartner/:id", getPartner);
router.post("/addPartner", addPartner);
router.put("/updatePartner/:id", updatePartner);
router.delete("/deletePartner/:id", deletePartner);

module.exports = router;
