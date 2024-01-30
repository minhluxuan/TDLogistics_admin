const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const otpController = require("../controllers/otpController");
const partnerStaffs = require("../database/PartnerStaffs");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "phone_number",
    passwordField: "otp",
}, async (phone_number, otp, done) => {
    const valid = await otpController.verifyOTPMiddleware(phone_number, otp);

    if (!valid) {
        return done(null, false);
    }

    const partnerStaff = await partnerStaffs.getOnePartnerStaff(["phone_number"], [phone_number]);

    if (partnerStaff.length <= 0) {
        done(null, false);
    }

    const staff_id = partnerStaff[0]["staff_id"];
    const partner_id = partnerStaff[0]["partner_id"];
    const permission = 2;

    return done(null, {
        staff_id,
        partner_id,
        permission,
    });
});

passport.use("otpPartnerStaffLogin", sessionStrategy);

router.post("/send_otp", otpController.createOTP);
router.post("/verify_otp", passport.authenticate("otpPartnerStaffLogin", {
    failureRedirect: "/api/v1/otp_partner_staff/otp_fail",
    successRedirect: "/api/v1/otp_partner_staff/otp_success",
    failureFlash: true,
}), otpController.verifyOTPSuccess);
router.get("/otp_fail", otpController.verifyOTPFail);
router.get("/otp_success", otpController.verifyOTPSuccess);

module.exports = router;