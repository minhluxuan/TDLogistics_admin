const express = require("express");
const auth = require("../lib/auth");
const shipmentController = require("../controllers/shipmentsController");

const router = express.Router();

router.post("/create",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),   
    shipmentController.createNewShipment);

router.post("/update",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.updateShipment);

router.post("/get",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.getShipments);

router.post("/decompose",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.decomposeShipment);


router.post("/confirm_create",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER"]),
    shipmentController.confirmCreateShipment);


router.delete("/delete", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.deleteShipment);

router.post("/search", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.getShipments);

router.post("/receive", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER"]),
    shipmentController.receiveShipment
);

router.post("/add_orders",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.addOrderToShipment);

router.post("/remove_orders", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.deleteOrderFromShipment);

router.post("/undertake", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]),
    shipmentController.undertakeShipment);

module.exports = router;