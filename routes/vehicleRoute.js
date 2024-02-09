const vehicleController = require("../controllers/vehicleController");
const express = require("express");
const auth = require("../lib/auth");

const router = express.Router();

router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), vehicleController.createNewVehicle);
router.get("/search", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER", "TRANSPORT_PARTNER", "PARTNER_STAFF_DRIVER", "PARTNER_STAFF_SHIPPER", "DRIVER", "SHIPPER"], []), vehicleController.getVehicle);
router.get("/search_order_ids", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER", "DRIVER", "SHIPPER"], []), vehicleController.getVehicleOrderIds);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), vehicleController.updateVehicle);
router.patch("/add_orders", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER"], []), vehicleController.addOrders);
router.patch("/delete_orders", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER"], []), vehicleController.deleteOrders)
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER"], []), vehicleController.deleteVehicle);

module.exports = router;
