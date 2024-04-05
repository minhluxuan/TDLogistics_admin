const express = require("express");
const auth = require("../lib/auth");
const shipmentController = require("../controllers/shipmentsController");

const router = express.Router();

router.get("/check", shipmentController.checkExistShipment);

router.get("/get_agencies", auth.isAuthenticated(), shipmentController.getAgenciesForShipment);

router.post("/create",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),   
    auth.isActive(),
    shipmentController.createNewShipment
);

router.post("/get",
    auth.isAuthenticated(),
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.getShipments
);

router.get("/get_orders",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.getOrdersFromShipment
);

router.post("/decompose",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.decomposeShipment
);


router.post("/confirm_create",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER"]),
    auth.isActive(),
    shipmentController.confirmCreateShipment
);


router.delete("/delete", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.deleteShipment
);

router.post("/search", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.getShipments
);

router.post("/receive", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER"]),
    auth.isActive(),
    shipmentController.receiveShipment
);

router.post("/add_orders",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.addOrderToShipment
);

router.post("/remove_orders", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.deleteOrderFromShipment
);

router.post("/undertake", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]),
    auth.isActive(),
    shipmentController.undertakeShipment
);

router.post("/update_journey",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.updateJourney
);

router.get("/get_journey",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    auth.isActive(),
    shipmentController.getJourney
);

module.exports = router;