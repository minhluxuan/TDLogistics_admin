const zaloZNS = require("../controllers/zaloZNSController");
const express = require("express");
const auth = require("../lib/auth");
const router = express.Router();

router.get("/callback", zaloZNS.sendMessage);

module.exports = router;
