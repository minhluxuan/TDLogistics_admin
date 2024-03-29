const driversController = require("../controllers/driversController");
const auth = require("../lib/auth");

const router = require("express").Router();

router.post("/get_tasks", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "PARTNER_DRIVER"]), auth.isActive(), driversController.getTasks);
router.post("/create_tasks", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]), auth.isActive(), driversController.createNewTask);
router.delete("/confirm_completed", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "PARTNER_DRIVER"]), auth.isActive(), driversController.confirmCompletedTask);

module.exports = router;
