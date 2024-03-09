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
    scheduleController.createNewSchedule
);

router.get(
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
    scheduleController.getSchedule
);
router.patch(
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
    scheduleController.deleteSchedule
);

module.exports = router;
