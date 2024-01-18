const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const bcrypt = require("bcrypt");
const staffsController = require("../controllers/staffsController");
const utils = require("../utils");
const Staffs = require("../database/Staffs");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "cccd",
    passwordField: "password",
}, async (cccd, password, done) => {
    const staff = await Staffs.getOneStaff(["cccd"], [cccd]);

    if (staff.length <= 0) {
        return done(null, false);
    }

    const passwordFromDatabase = staff[0]["password"];
    const match = bcrypt.compareSync(password, passwordFromDatabase);

    if (!match) {
        return done(null, false);
    }

    const staff_id = staff[0]["staff_id"];
    const agency_id = staff[0]["agency_id"];
    const permission = 2;

    return done(null, {
        staff_id,
        agency_id,
        permission,
    });
});

passport.use("normalLogin", sessionStrategy);

const storage = multer.diskStorage({
    destination: function (req, file, done) {
        if (!file) {
            return done(new Error("Hình ảnh không hợp lệ."), false);
        }

        if (file.fieldname.length > 20) {
            return done(new Error("Tên file quá dài."), false); 
        }

        if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") { 
            return done(null, 'img/avatar');
        }

        done(new Error("Hình ảnh không hợp lệ"), false);
    },

    filename: function (req, file, done) {
        done(null, file.fieldname + '-' + Date.now() + ".jpg");
    }
});
   
const upload = multer({ storage: storage });

router.post("/login", passport.authenticate("normalLogin", {
    successRedirect: "/api/v1/staffs/login_success",
    failureRedirect: "/api/v1/staffs/login_fail",
    failureFlash: true,
}), staffsController.verifyStaffSuccess);
router.post("/create", upload.single("avatar"), staffsController.createNewStaff);
router.get("/search", staffsController.getStaffs);
router.delete("/delete",staffsController.deleteStaff);
router.patch("/update", staffsController.updateStaffInfo);
router.post("/login_success", staffsController.verifyStaffSuccess);
router.post("/login_fail", staffsController.verifyStaffFail);
router.patch("/update_password", staffsController.updatePassword);
router.patch("/update_avatar", utils.isAuthenticated(2), upload.single("avatar"), staffsController.updateAvatar);

passport.serializeUser(utils.setStaffSession);
passport.deserializeUser((staff, done) => {
    utils.verifyStaffPermission(staff, done);
});

module.exports = router;
