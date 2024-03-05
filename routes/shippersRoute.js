const router = require("express").Router();
const shippersController = require("../controllers/shippersController");
const auth = require("../lib/auth");

router.post("/get_tasks", auth.isAuthenticated(), auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]), shippersController.getTasks);
router.patch("/confirm_completed", auth.isAuthenticated(), auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]), shippersController.confirmCompletedTask);
router.post("/get_history", auth.isAuthenticated(), auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]), shippersController.getHistory);

module.exports = router;