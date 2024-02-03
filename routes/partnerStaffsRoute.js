const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const bcrypt = require("bcrypt");
const partnerStaffsController = require("../controllers/partnerStaffControllers");
const utils = require("../utils");
const PartnerStaffs = require("../database/PartnerStaffs");
const path = require('path');
const fs = require("fs");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "cccd",
    passwordField: "password",
}, async (cccd, password, done) => {
    const partnerStaff = await PartnerStaffs.getOnePartnerStaff(["cccd"], [cccd]);

    if (partnerStaff.length <= 0) {
        return done(null, false);
    }

    const passwordFromDatabase = partnerStaff[0]["password"];
    const match = bcrypt.compareSync(password, passwordFromDatabase);

    if (!match) {
        return done(null, false);
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

passport.use("partnerStaffLogin", sessionStrategy);

const storage = multer.diskStorage({	
    destination: async function (req, file, done) {
        let folderPath;

        if (file.fieldname === "license_before")
        {
            folderPath = path.join("storage", "partner_staff", "img", "license_temp");

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
        }
        else if (file.fieldname === "license_after")
        {
            folderPath = path.join("storage", "partner_staff", "img", "license_temp");

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
        }
        else if (file.fieldname === "avatar")
        {
            folderPath = path.join("storage","partner_staff", "img", "avatar_temp");

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
        }
        
        return done(null, folderPath);
    },

    filename: function (req, file, done) {
        done(null,  Date.now() + "_" + file.originalname);
    }
});

const fileFilter = (req, file, done) => {
    if (!file) {
        return done(new Error("File hợp đồng không tồn tại."));
    }

    if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype && "image/png") { 
       return done(new Error("Hình ảnh không hợp lệ"));
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
        done(new Error("File có kích thước quá lớn. Tối đa 5MB được cho phép"));
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

const user = new utils.User();

router.post("/login", passport.authenticate("partnerStaffLogin", {
    successRedirect: "/api/v1/partner_staff/login_success",
    failureRedirect: "/api/v1/partner_staff/login_fail",
    failureFlash: true,
    }), partnerStaffsController.verifyStaffSuccess);
router.post("/create", user.isAuthenticated(), user.isAuthorized([], []), 
    upload.fields([{
            name: 'avatar', maxCount: 1
        }, {
            name: 'license_before', maxCount: 1
        }, {
            name: 'license_after', maxCount: 1
        }]), partnerStaffsController.createNewPartnerStaff);
router.get("/search", user.isAuthenticated(), user.isAuthorized(2), partnerStaffsController.getPartnerStaffs);
router.delete("/delete", user.isAuthenticated(), user.isAuthorized(2), partnerStaffsController.deletePartnerStaff);
router.patch("/update", user.isAuthenticated(), user.isAuthorized(2), partnerStaffsController.updatePartnerStaffInfo);
router.post("/login_success", user.isAuthenticated(), user.isAuthorized(2), partnerStaffsController.verifyStaffSuccess);
router.post("/login_fail", user.isAuthenticated(), user.isAuthorized(2), partnerStaffsController.verifyStaffFail);
router.patch("/update_password", user.isAuthenticated(), user.isAuthorized(2), partnerStaffsController.updatePartnerPassword);
router.patch("/update_avatar", user.isAuthenticated(), user.isAuthorized(2), upload.single("avatar"), partnerStaffsController.updatePartnerAvatar);
router.patch("/update_license", user.isAuthenticated(), user.isAuthorized(2),  upload.fields([{
    name: 'license_before', maxCount: 1
}, {
    name: 'license_after', maxCount: 1
}]), partnerStaffsController.updatePartnerLicenseImg);

router.get("/logout", partnerStaffsController.logout);


module.exports = router;