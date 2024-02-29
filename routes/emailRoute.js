const emailController = require("../controllers/emailController");
const express = require("express");
const auth = require("../lib/auth");
const router = express.Router();
router.post("/create", emailController.createNewEmail);
module.exports = router;
