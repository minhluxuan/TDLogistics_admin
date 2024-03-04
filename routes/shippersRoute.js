const router = require("express").Router();
const shippersController = require("../controllers/shippersController");
const auth = require("../lib/auth");

router.post("/get_tasks", auth.isAuthenticated(), auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]), shippersController.getTasks);

module.exports = router;