const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const staffsController = require("../controllers/staffsController");
const utils = require("../utils");
const Staffs = require("../database/Staffs");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "cccd",
    passwordField: "password",
}, async (cccd, password, done) => {
    const result = await Staffs.getOneStaff(["cccd", "password"], [cccd, password]);

    if (result.length <= 0) {
        done(null, false);
    }

    const staff_id = result[0]["staff_id"];
    const agency_id = result[0]["agency_id"];

    const permission = 3;

    return done(null, {
        staff_id,
        agency_id,
        permission,
    });
});

passport.use(sessionStrategy);

router.post("/login", passport.authenticate("local", {
    successRedirect: "/api/v1/staffs/login_success",
    failureRedirect: "/api/v1/staffs/login_fail",
    failureFlash: true,
}), staffsController.verifyStaffSuccess);
router.post("/create", staffsController.createNewStaff);
router.get("/search", staffsController.getStaffs);
router.delete("/delete",staffsController.deleteStaff);
router.patch("/update",staffsController.updateStaffInfo);
router.get("/login_success", staffsController.verifyStaffSuccess);
router.get("/login_fail", staffsController.verifyStaffFail);

passport.serializeUser(utils.setStaffSession);
passport.deserializeUser((staff, done) => {
    utils.verifyStaffPermission(staff, done);
});

module.exports = router;