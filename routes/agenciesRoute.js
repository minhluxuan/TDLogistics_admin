const express = require("express");
const agenciesController = require("../controllers/agenciesController");
const auth = require("../lib/auth");

const router = express.Router();

router.get("/check", agenciesController.checkExistAgency);
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER"], [3]), agenciesController.createNewAgency);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER"], [4]), agenciesController.updateAgency);
router.get("/search", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"], [1, 2]), agenciesController.getAgencies);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER"], [5]), agenciesController.deleteAgency);

module.exports = router;