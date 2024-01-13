const express = require("express");
const authorsController = require("../controllers/authorsController");

const router = express.Router();

router.post("/create", authorsController.createNewStaff);
router.get("/", authorsController.getAllStaffs);
router.get("/search", authorsController.getStaff);
router.delete("/delete",authorsController.deleteStaff);
router.patch("/update",authorsController.updateStaffInfo);

module.exports = router;