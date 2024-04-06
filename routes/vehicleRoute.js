const vehicleController = require("../controllers/vehicleController");
const express = require("express");
const auth = require("../lib/auth");

const router = express.Router();

router.get("/check", auth.isAuthenticated(), vehicleController.checkExistVehicle);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    vehicleController.createNewVehicle
);
router.post(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "TRANSPORT_PARTNER_REPRESENTOR", "PARTNER_DRIVER", "PARTNER_SHIPPER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    auth.isActive(),
    vehicleController.getVehicle
);
router.get(
    "/get_shipments",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "PARTNER_DRIVER", "PARTNER_SHIPPER"]),
    auth.isActive(),
    vehicleController.getVehicleShipmentIds
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    vehicleController.updateVehicle
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    auth.isActive(),
    vehicleController.deleteVehicle
);
router.get("/undertake", auth.is)
router.patch(
    "/add_shipments",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    auth.isActive(),
    vehicleController.addShipmentToVehicle
);
router.patch(
    "/delete_shipments",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    auth.isActive(),
    vehicleController.deleteShipmentFromVehicle
);

module.exports = router;
