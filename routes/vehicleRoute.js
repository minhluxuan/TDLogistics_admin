const vehicleController = require("../controllers/vehicleController");
const express = require("express");
const utils = require("../utils");


const router = express.Router();

const user = new utils.User();

router.post("/create", user.isAuthenticated(), user.isAuthorized(2, 3, 5, 7, 9, 10), vehicleController.createNewVehicle);
router.get("/search", user.isAuthenticated(), user.isAuthorized(2, 3, 5, 7, 9, 10), vehicleController.getVehicle);
router.get("/search_order_ids", user.isAuthenticated(), user.isAuthorized(2, 3, 5, 7, 9, 10), vehicleController.getVehicleOrderIds);
router.patch("/update", vehicleController.updateVehicle);
router.patch("/add_orders", user.isAuthenticated(), user.isAuthorized(2, 3, 5, 7, 9, 10), vehicleController.addOrders);
router.patch("/delete_orders", user.isAuthenticated(), user.isAuthorized(2, 3, 5, 7, 9, 10), vehicleController.deleteOrders)
router.delete("/delete", user.isAuthenticated(), user.isAuthorized(2, 3, 5, 7, 9, 10), vehicleController.deleteVehicle);

module.exports = router;
