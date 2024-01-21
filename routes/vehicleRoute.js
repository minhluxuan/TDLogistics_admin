const vehicleController = require("../controllers/vehicleController");
const express = require("express");
const router = express.Router();

router.post("/create", vehicleController.createNewVehicle);
router.get("/search", vehicleController.getVehicle);
router.get("/search_order_id", vehicleController.getVehicleOrderID);
router.patch("/update", vehicleController.updateVehicle);
router.delete("/delete", vehicleController.deleteVehicle);
module.exports = router;
