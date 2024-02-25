const express = require("express");
const ordersController = require("../controllers/ordersController");
const auth = require("../lib/auth");

const router = express.Router();

router.get("/check", ordersController.checkExistOrder);
router.post("/search", auth.isAuthenticated(), auth.isAuthorized(["USER", "BUSINESS", "ADMIN", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_SHIPPER", "PARTNER_SHIPPER", "SHIPPER"]), ordersController.getOrders);
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["USER", "ADMIN", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]), ordersController.createNewOrder);
router.patch("/update", auth.isAuthenticated(), auth.isAuthorized(["USER", "ADMIN", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER", "SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]), ordersController.updateOrder);
router.delete("/cancel", auth.isAuthenticated(), auth.isAuthorized(["USER", "ADMIN", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]), ordersController.cancelOrder);
router.get("/", (req, res) => {
    res.render("order");
});

//router.post("/agency_create", ordersController.createOrderForAgency);

module.exports = router;