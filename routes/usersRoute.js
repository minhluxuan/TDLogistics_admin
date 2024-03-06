const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const usersController = require("../controllers/usersController");
const Users = require("../database/Users");
const auth = require("../lib/auth");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "phone_number",
    passwordField: "otp",
}, async (phone_number, otp, done) => {
    const valid = await usersController.verifyOTPMiddleware(phone_number, otp);
    if (!valid) {
        return done(null, false);
    }

    const resultGettingOneUser = await Users.getOneUser({ phone_number: phone_number });
    if (!resultGettingOneUser || resultGettingOneUser.length === 0) {
        return done(null, false);
    }
    
    const user = resultGettingOneUser[0];
    if (!user) {
        return done(null, false);
    }

    const user_id = user.user_id;
    const fullname = user.fullname;

    const role = "USER";

    return done(null, {
        role,
        user_id,
        fullname,
        phone_number,
    });
});

passport.use("otpLogin", sessionStrategy);

router.get("/login", (req, res) => {
    res.render("userLogin");
});
router.post("/send_otp", usersController.createOTP);
router.post("/verify_otp", passport.authenticate("otpLogin"), (req, res, next) => {
    passport.authenticate("otpLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({ error: true, valid: false, message: "Xác thực thất bại." });
        }
        console.log(req);
        return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
    })(req, res, next);
});
router.post("/check", usersController.checkExistUser);
router.post("/create", usersController.createNewUser);
router.post("/search", auth.isAuthenticated(), auth.isAuthorized(["USER"]), usersController.getOneUser);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["USER"]), usersController.updateUserInfo);
router.get("/logout", auth.isAuthenticated(), auth.isAuthorized(["USER"]), usersController.logout);

module.exports = router;
