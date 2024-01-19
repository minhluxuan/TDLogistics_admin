const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const bcrypt = require("bcrypt");
const businessController = require("../controllers/businessController");
const utils = require("../utils");
const Business = require("../database/Business");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
}, async (email, password, done) => {
    const staff = await Business.getOneBusinessUser(["email"], [email]);

    if (staff.length <= 0) {
        return done(null, false);
    }

    const passwordFromDatabase = staff[0]["password"];
    const match = bcrypt.compareSync(password, passwordFromDatabase);

    if (!match) {
        return done(null, false);
    }

    const business_id = staff[0]["business_id"];
    const permission = 1;

    return done(null, {
        business_id,
        permission,
    });
});

passport.use("businessLogin", sessionStrategy);

const storage = multer.diskStorage({
    destination: function (req, file, done) {
        if (!file) {
            return done(new Error("File không hợp lệ."), false);
        }

        if (file.fieldname.length > 20) {
            return done(new Error("Tên file quá dài."), false); 
        }

        if (file.mimetype === "application/pdf" ) { 
            return done(null, 'documents/contacts');
        }

        done(new Error("Hình ảnh không hợp lệ"), false);
    },

    filename: function (req, file, done) {
        done(null, file.fieldname + '-' + Date.now() + ".pdf");
    }
});
   
const upload = multer({ storage: storage });

router.post("/login", passport.authenticate("businessLogin", {
    successRedirect: "/api/v1/staffs/login_success",
    failureRedirect: "/api/v1/staffs/login_fail",
    failureFlash: true,
}), staffsController.verifyStaffSuccess);

router.post("/create", upload.single("contacts"), businessController.createNewBusinessUser);
router.get("/search", businessController.getBusiness);


// router.delete("/delete",staffsController.deleteStaff);
// router.patch("/update", staffsController.updateStaffInfo);
// router.post("/login_success", staffsController.verifyStaffSuccess);
// router.post("/login_fail", staffsController.verifyStaffFail);
// router.patch("/update_password", staffsController.updatePassword);
// router.patch("/update_avatar", utils.isAuthenticated(2), upload.single("avatar"), staffsController.updateAvatar);

// passport.serializeUser(utils.setBusinessSession);
// passport.deserializeUser((staff, done) => {
//     utils.verifyStaffPermission(staff, done);
// });

module.exports = router;
