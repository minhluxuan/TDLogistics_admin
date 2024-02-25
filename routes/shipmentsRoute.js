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


router.post("/decompose",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.decomposeShipment);


router.post("/confirm",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.confirmCreateShipment);


router.delete("/delete", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.deleteShipment);

router.post("/search", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER"]),
    shipmentController.getShipmentForAgency);

router.post("/updatedb", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.updateShipmentToDatabase);

router.post("/recieve", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.recieveShipment);


router.post("/add",
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.addOrderToShipment);

router.post("/remove", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.deleteOrderFromShipment);

router.post("/undertake", 
    auth.isAuthenticated(), 
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_TELLER", "MANAGER", "TELLER", "ADMIN"]),
    shipmentController.undertakeShipment);

module.exports = router;