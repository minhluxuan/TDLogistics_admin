const driversController = require("../controllers/driversController");
const auth = require("../lib/auth");

const router = require("express").Router();

router.get("/get_objects", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]), auth.isActive(), driversController.getObjectsCanHandleTask);
router.post("/get_tasks", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "PARTNER_DRIVER"]), auth.isActive(), driversController.getTasks);
router.post("/create_tasks", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]), auth.isActive(), driversController.createNewTask);
router.delete("/confirm_completed", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "PARTNER_DRIVER"]), auth.isActive(), driversController.confirmCompletedTask);
router.post("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]), auth.isActive(), driversController.deleteTask);
module.exports = router;
