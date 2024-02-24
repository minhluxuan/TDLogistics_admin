const express = require("express");
const agenciesController = require("../controllers/agenciesController");
const auth = require("../lib/auth");

const router = express.Router();

router.get("/check", agenciesController.checkExistAgency);
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]), agenciesController.createNewAgency);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]), agenciesController.updateAgency);
router.post(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "HUMAN_RESOURCE_MANAGER", "MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    agenciesController.getAgencies
);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]), agenciesController.deleteAgency);

module.exports = router;