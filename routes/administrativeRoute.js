const express = require("express");
const administrativeController = require("../controllers/administrativeController")
const auth = require("../lib/auth");

const router = express.Router();

router.post(
    "/search",
    administrativeController.getUnits
);

module.exports = router;