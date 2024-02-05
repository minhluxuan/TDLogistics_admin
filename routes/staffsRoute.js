const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const staffsController = require("../controllers/staffsController");
const auth = require("../lib/auth");
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
    const privileges = staff[0].privileges ? JSON.parse(staff[0].privileges) : new Array();
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
        if (file.fieldname !== "avatar") {
            return done(new Error('Yêu cầu tên trường phải là "avatar".'));
        }

        const folderPath = path.join("storage", "staff", "img", "avatar_temp");

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        return done(null, folderPath);
    },

    filename: function (req, file, done) {
        done(null,  Date.now() + "_" + file.originalname);
    }
});
   
const fileFilter = (req, file, done) => {
    if (!file) {
        return done(new Error("File không tồn tại."));
    }

    if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype && "image/png") { 
       return done(new Error("Hình ảnh không hợp lệ. Chỉ các file .jpg, .jpeg, .png được cho phép."));
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
        done(new Error("File có kích thước quá lớn. Tối đa 5MB được cho phép."));
    }

    if (file.originalname.length > 100) {
        done(new Error("Tên file quá dài. Tối đa 100 ký tự được cho phép."));
    }

    return done(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

router.post("/login", passport.authenticate("normalLogin", {
    successRedirect: "/api/v1/staffs/login_success",
    failureRedirect: "/api/v1/staffs/login_fail",
    failureFlash: true,
}), staffsController.verifyStaffSuccess);
router.get("/search", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "COMPLAINTS_SOLVER", "DRIVER", "SHIPPER"], []), staffsController.getStaffs);
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), upload.single("avatar"), staffsController.createNewStaff);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), staffsController.updateStaffInfo);
router.patch("/update_password", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "COMPLAINTS_SOLVER", "DRIVER", "SHIPPER"], []), staffsController.updatePassword);
router.patch("/update_avatar", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER", "COMPLAINTS_SOLVER", "DRIVER", "SHIPPER"], []), upload.single("avatar"), staffsController.updateAvatar);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []), staffsController.deleteStaff);
router.post("/login_success", staffsController.verifyStaffSuccess);
router.post("/login_fail", staffsController.verifyStaffFail);

module.exports = router;
