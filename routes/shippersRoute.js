const router = require("express").Router();
const shippersController = require("../controllers/shippersController");
const auth = require("../lib/auth");

router.post(
    "/create_tasks",
    auth.isAuthenticated(),
    auth.isAuthorized(["AGENCY_MANANGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    shippersController.createNewTask
);
router.post(
    "/get_tasks",
    auth.isAuthenticated(),
    auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]),
    auth.isActive(),
    shippersController.getTasks
);
router.patch(
    "/confirm_completed",
    auth.isAuthenticated(),
    auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]),
    auth.isActive(),
    shippersController.confirmCompletedTask
);
router.post(
    "/get_history",
    auth.isAuthenticated(),
    auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]),
    auth.isActive(),
    shippersController.getHistory
);

module.exports = router;