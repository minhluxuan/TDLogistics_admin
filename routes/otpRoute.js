const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const otpController = require("../controllers/otpController");
const Staffs = require("../database/Staffs");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "phone_number",
    passwordField: "otp",
}, async (phone_number, otp, done) => {
    const valid = await otpController.verifyOTPMiddleware(phone_number, otp);

    if (!valid) {
        return done(null, false);
    }

    const resultGettingOneStaff = await Staffs.getOneStaff({ phone_number: phone_number });

    if (resultGettingOneStaff.length <= 0) {
        done(null, false);
    }

    const staff = resultGettingOneStaff[0];

    if (!staff) {
        return done(null, false);
    }

    const staff_id = staff.staff_id;
    const agency_id = staff.agency_id;
    const role = staff.role;
    const privileges = staff.privileges;
    const active = staff.active;

    return done(null, {
        staff_id,
        agency_id,
        role,
        privileges,
        active,
    });
});

passport.use("otpLogin", sessionStrategy);

router.post("/send_otp", otpController.createOTP);
router.post("/verify_otp", (req, res, next) => {
    passport.authenticate("otpLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: true, message: "Xác thực thất bại." });
        }

        return res.status(200).json({ error: false, message: "Xác thực thành công." });
    })(req, res, next);
});

module.exports = router;