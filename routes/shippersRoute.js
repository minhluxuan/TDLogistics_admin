const router = require("express").Router();
const shippersController = require("../controllers/shippersController");
const auth = require("../lib/auth");

router.get(
    "/get_objects",
    auth.isAuthenticated(),
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    shippersController.getObjectsCanHandleTask
);
router.post(
    "/create_tasks",
    auth.isAuthenticated(),
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    shippersController.createNewTask
);
router.post(
    "/get_tasks",
    auth.isAuthenticated(),
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "SHIPPER", "AGENCY_SHIPPER"]),
    auth.isActive(),
    shippersController.getTasks
);
router.patch(
    "/confirm_completed",
    // auth.isAuthenticated(),
    // auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER"]),
    auth.isActive(),
    shippersController.confirmCompletedTask
);
router.post(
    "/get_history",
    auth.isAuthenticated(),
    auth.isAuthorized(["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "SHIPPER", "AGENCY_SHIPPER"]),
    auth.isActive(),
    shippersController.getHistory
);

module.exports = router;