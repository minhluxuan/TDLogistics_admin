const express = require("express");
const shipmentController = require("../controllers/shipmentsController");

const router = express.Router();

router.post("/create", shipmentController.createNewShipment);
router.post("/update", shipmentController.updateShipment);
router.post("/decompose", shipmentController.decompseShipment);
router.post("/confirm", shipmentController.confirmCreateShipment);
router.delete("/delete", shipmentController.deleteShipment);
router.get("/search", shipmentController.getShipmentForAgency);
router.post("/updatedb", shipmentController.updateShipmentToDatabase);

module.exports = router;