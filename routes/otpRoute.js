const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const otpController = require("../controllers/otpController");
const Staffs = require("../database/Staffs");
const utils = require("../utils");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "phone_number",
    passwordField: "otp",
}, async (phone_number, otp, done) => {
    const valid = await otpController.verifyOTPMiddleware(phone_number, otp);

    if (!valid) {
        return done(null, false);
    }

    const staff = await Staffs.getOneStaff(["phone_number"], [phone_number]);

    if (staff.length <= 0) {
        done(null, false);
    }

    const staff_id = staff[0]["staff_id"];
    const agency_id = staff[0]["agency_id"];

    const permission = {
        primary: [2],
        privilege: []
    };

    return done(null, {
        staff_id,
        agency_id,
        permission
    });
});

passport.use("otpLogin", sessionStrategy);

router.post("/send_otp", otpController.createOTP);
router.post("/verify_otp", passport.authenticate("otpLogin", {
    failureRedirect: "/api/v1/otp/otp_fail",
    successRedirect: "/api/v1/otp/otp_success",
    failureFlash: true,
}), otpController.verifyOTPSuccess);
router.get("/otp_fail", otpController.verifyOTPFail);
router.get("/otp_success", otpController.verifyOTPSuccess);

module.exports = router;