const express = require("express");
const shipmentController = require("../controllers/shipmentsController");

const router = express.Router();

router.post("/create", shipmentController.createNewShipment);
router.post("/update", shipmentController.updateShipment);
router.post("/decompose", shipmentController.decomposeShipment);
router.post("/confirm", shipmentController.confirmCreateShipment);
router.delete("/delete", shipmentController.deleteShipment);
router.get("/search", shipmentController.getShipmentForAgency);
router.post("/updatedb", shipmentController.updateShipmentToDatabase);
router.post("/recieve", shipmentController.recieveShipment);
router.post("/add", shipmentController.addOrderToShipment);
router.post("/remove", shipmentController.deleteOrderFromShipment);

module.exports = router;