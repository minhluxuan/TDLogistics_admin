const express = require("express");
const agenciesController = require("../controllers/agenciesController");
const auth = require("../lib/auth");

const router = express.Router();

router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_PROVINCE"], [1, 2, 3]), agenciesController.createNewAgency);
router.post("/update", agenciesController.updateAgency);
router.get("/search", agenciesController.getAgencies);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY"], []), agenciesController.deleteAgency);

module.exports = router;