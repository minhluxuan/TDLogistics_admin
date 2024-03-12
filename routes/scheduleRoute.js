const express = require("express");
const scheduleController = require("../controllers/todoController");
const auth = require("../lib/auth");

const router = express.Router();

router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized([
        "ADMIN",
        "MANAGER",
        "HUMAN_RESOURCE_MANAGER",
        "TELLER",
        "COMPLAINTS_SOLVER",
        "AGENCY_MANAGER",
        "AGENCY_HUMAN_RESOURCE_MANAGER",
        "AGENCY_TELLER",
        "AGENCY_COMPLAINTS_SOLVER",
    ]),
    auth.isActive(),
    scheduleController.createNewSchedule
);

router.post(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized([
        "ADMIN",
        "MANAGER",
        "HUMAN_RESOURCE_MANAGER",
        "TELLER",
        "COMPLAINTS_SOLVER",
        "AGENCY_MANAGER",
        "AGENCY_HUMAN_RESOURCE_MANAGER",
        "AGENCY_TELLER",
        "AGENCY_COMPLAINTS_SOLVER",
    ]),
    auth.isActive(),
    scheduleController.getSchedule
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized([
        "ADMIN",
        "MANAGER",
        "HUMAN_RESOURCE_MANAGER",
        "TELLER",
        "COMPLAINTS_SOLVER",
        "AGENCY_MANAGER",
        "AGENCY_HUMAN_RESOURCE_MANAGER",
        "AGENCY_TELLER",
        "AGENCY_COMPLAINTS_SOLVER",
    ]),
    auth.isActive(),
    scheduleController.updateSchedule
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized([
        "ADMIN",
        "MANAGER",
        "HUMAN_RESOURCE_MANAGER",
        "TELLER",
        "COMPLAINTS_SOLVER",
        "AGENCY_MANAGER",
        "AGENCY_HUMAN_RESOURCE_MANAGER",
        "AGENCY_TELLER",
        "AGENCY_COMPLAINTS_SOLVER",
    ]),
    auth.isActive(),
    scheduleController.deleteTask
);

module.exports = router;