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
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    const staff = await Staffs.getOneStaff(["username"], [username]);

    if (staff.length <= 0) {
        return done(null, false);
    }

    const passwordFromDatabase = staff[0]["password"];
    const match = bcrypt.compareSync(password, passwordFromDatabase);

    if (!match) {
        return done(null, false);
    }

    const staff_id = staff[0].staff_id;
    const agency_id = staff[0].agency_id;
    const role = staff[0].role;
    const privileges = JSON.parse(staff[0].privileges);
    const active = staff[0].active;

    return done(null, {
        staff_id,
        agency_id,
        role,
        privileges,
        active,
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

const user =  new utils.User();

router.post("/login", passport.authenticate("normalLogin", {
    successRedirect: "/api/v1/staffs/login_success",
    failureRedirect: "/api/v1/staffs/login_fail",
    failureFlash: true,
}), staffsController.verifyStaffSuccess);
router.get("/search", user.isAuthenticated(), user.isAuthorized(2, 3, 4, 5, 6, 7, 8, 9, 10, 15), staffsController.getStaffs);
router.post("/create", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 10, 16), upload.single("avatar"), staffsController.createNewStaff);
router.patch("/update", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 10, 17), staffsController.updateStaffInfo);
router.patch("/update_password", user.isAuthenticated(), user.isAuthorized(2, 3, 4, 5, 6, 7, 8, 9, 10, 17), staffsController.updatePassword);
router.patch("/update_avatar", user.isAuthenticated(), user.isAuthorized(2, 3, 4, 5, 6, 7, 8, 9, 10, 17), user.isAuthenticated(), user.isAuthorized(2), upload.single("avatar"), staffsController.updateAvatar);
router.delete("/delete", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 10, 18), staffsController.deleteStaff);
router.post("/login_success", staffsController.verifyStaffSuccess);
router.post("/login_fail", staffsController.verifyStaffFail);

module.exports = router;
