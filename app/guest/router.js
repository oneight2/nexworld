var express = require("express");
var router = express.Router();
const {
  getGuests,
  getGuest,
  addGuest,
  updateGuest,
  deleteGuest,
  search,
} = require("./controller");

router.get("/getGuests", getGuests);
router.get("/", search);
router.get("/getGuest/:id", getGuest);
router.post("/addGuest", addGuest);
router.put("/updateGuest/:id", updateGuest);
router.delete("/deleteGuest/:id", deleteGuest);

module.exports = router;
