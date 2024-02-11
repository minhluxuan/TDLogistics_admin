const express = require("express");
const authorizationController = require("../controllers/authorizationController");
const auth = require("../lib/auth");

const router = express.Router();

router.get("/search", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), authorizationController.getPermissionByRole);
router.patch("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), authorizationController.grantPermissions);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), authorizationController.revokePermissions);

module.exports = router;