const emailController = require("../controllers/emailController");
const express = require("express");
const router = require("./containersRoute");
router = express.Router();
const Validation = require("../lib/validation");
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER"]),
    emailController.createEmail
);
router.get("/get");
router.delete("/delete");
