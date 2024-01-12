const express = require("express");
const shipmentController = require("../controllers/shipmentController");

const router = express.Router();

router.post("/create", shipmentController.createNewShipment);

module.exports = router;