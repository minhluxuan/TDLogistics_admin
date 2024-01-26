const express = require("express");
const authorizationController = require("../controllers/authorizationController");
const utils = require("../utils");

const router = express.Router();

const user =  new utils.User();

router.get("/search", user.isAuthenticated(), user.isAuthorized(2), authorizationController.getPermission);
router.put("/update", user.isAuthenticated(), user.isAuthorized(2), authorizationController.updatePermission);
router.delete("/delete", user.isAuthenticated(), user.isAuthorized(2), authorizationController.deletePermission);

module.exports = router;