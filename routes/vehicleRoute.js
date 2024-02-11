const vehicleController = require("../controllers/vehicleController");
const express = require("express");
const auth = require("../lib/auth");

const router = express.Router();

router.get("/check", auth.isAuthenticated(), vehicleController.checkExistVehicle);
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), vehicleController.createNewVehicle);
router.get("/search", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "TRANSPORT_PARTNER", "PARTNER_STAFF_DRIVER", "PARTNER_STAFF_SHIPPER", "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"], [41, 42, 43]), vehicleController.getVehicle);
router.get("/search_order_ids", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER", "DRIVER", "SHIPPER"], [49]), vehicleController.getVehicleOrderIds);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "AGENCY_MANAGER"], [47, 48]), vehicleController.updateVehicle);
router.patch("/add_orders", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"], [50, 51]), vehicleController.addOrders);
router.patch("/delete_orders", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "AGENCY_TELLER"], [52, 53]), vehicleController.deleteOrders)
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "AGENCY_MANAGER"], [54, 55]), vehicleController.deleteVehicle);

module.exports = router;
