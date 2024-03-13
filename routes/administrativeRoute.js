const express = require("express");
const administrativeController = require("../controllers/administrativeController")
const auth = require("../lib/auth");

const router = express.Router();

router.get(
    "/search",
    auth.isAuthenticated(),
    administrativeController.getUnits
);

module.exports = router;