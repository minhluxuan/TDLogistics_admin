const vehicleController = require("../controllers/vehicleController");
const express = require("express");
const auth = require("../lib/auth");

const router = express.Router();

router.get("/check", auth.isAuthenticated(), vehicleController.checkExistVehicle);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    vehicleController.createNewVehicle
);
router.get(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "TRANSPORT_PARTNER_REPRESENTOR", "PARTNER_DRIVER", "PARTNER_SHIPPER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    vehicleController.getVehicle
);
router.get(
    "/search_order_ids",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "PARTNER_DRIVER", "PARTNER_SHIPPER"]),
    vehicleController.getVehicleOrderIds
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "HUMAN_RESOURCE_MANAGER"]),
    vehicleController.updateVehicle
);
router.patch(
    "/add_orders",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    vehicleController.addOrders
);
router.patch(
    "/delete_orders",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    vehicleController.deleteOrders
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    vehicleController.deleteVehicle
);

module.exports = router;
