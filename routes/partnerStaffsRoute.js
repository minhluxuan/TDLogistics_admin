const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const bcrypt = require("bcrypt");
const partnerStaffsController = require("../controllers/partnerStaffControllers");
const PartnerStaffs = require("../database/PartnerStaffs");
const path = require('path');
const auth = require("../lib/auth");
const fs = require("fs");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    const resultGettingOnePartnerStaff = await PartnerStaffs.getOnePartnerStaff({ username: username });

    if (resultGettingOnePartnerStaff.length <= 0) {
        return done(null, false);
    }

    const partnerStaff = resultGettingOnePartnerStaff[0];

    const passwordFromDatabase = partnerStaff.password;
    const match = bcrypt.compareSync(password, passwordFromDatabase);

    if (!match) {
        return done(null, false);
    }

    const partner_id = partnerStaff.partner_id;
    const staff_id = partnerStaff.staff_id;
    const agency_id = partnerStaff.agency_id;
    const role = partnerStaff.role;
    const active = partnerStaff.active;

    return done(null, {
        staff_id,
        partner_id,
        agency_id,
        role,
        active,
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
        return done(new Error("File không tồn tại."));
    }

    if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") { 
       return done(new Error("Hình ảnh không hợp lệ."));
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

router.post("/login", passport.authenticate("partnerStaffLogin"), (req, res, next) => {
    passport.authenticate("partnerStaffLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: true, message: "Xác thực thất bại." });
        }

        return res.status(200).json({ error: false, message: "Xác thực thành công." });
    })(req, res, next);
});
router.get("/check", partnerStaffsController.checkExistPartnerStaff);
router.get("/get_info", partnerStaffsController.getAuthenticatedStaffInfo);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]), 
    upload.fields([{
            name: 'avatar', maxCount: 1
        }, {
            name: 'license_before', maxCount: 1
        }, {
            name: 'license_after', maxCount: 1
        }]),
        auth.isActive(),
        partnerStaffsController.createNewPartnerStaff);
router.post(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER",
    "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER",
    "TRANSPORT_PARTNER_REPRESENTOR", "PARTNER_DRIVER", "PARTNER_SHIPPER"], []),
    auth.isActive(),
    partnerStaffsController.getPartnerStaffs
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    partnerStaffsController.deletePartnerStaff
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    partnerStaffsController.updatePartnerStaffInfo
);
router.patch(
    "/update_password",
    auth.isAuthenticated(),
    auth.isAuthorized(["PARTNER_DRIVER", "PARTNER_SHIPPER"]),
    partnerStaffsController.updatePartnerPassword
);
router.patch(
    "/update_avatar",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE"]),
    upload.single("avatar"),
    auth.isActive(),
    partnerStaffsController.updatePartnerAvatar
);
router.patch(
    "/update_licenses",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    upload.fields([{
        name: 'license_before', maxCount: 1
    }, {
        name: 'license_after', maxCount: 1
    }]),
    auth.isActive(),
    partnerStaffsController.updatePartnerLicenseImg);
router.get(
    "/logout",
    auth.isAuthenticated(),
    auth.isAuthorized(["PARTNER_DRIVER", "PARTNER_SHIPPER"]),
    partnerStaffsController.logout
);

router.get(
    "/get_avatar",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER",
    "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER",
    "TRANSPORT_PARTNER_REPRESENTOR", "PARTNER_DRIVER", "PARTNER_SHIPPER"]),
    partnerStaffsController.getPartnerAvatar
);

router.get(
    "/get_license_before",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER",
    "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER",
    "TRANSPORT_PARTNER_REPRESENTOR", "PARTNER_DRIVER", "PARTNER_SHIPPER"]),
    partnerStaffsController.getPartnerLicenseBefore
);

router.get(
    "/get_license_after",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER",
    "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER",
    "TRANSPORT_PARTNER_REPRESENTOR", "PARTNER_DRIVER", "PARTNER_SHIPPER"]),
    partnerStaffsController.getPartnerLicenseAfter
);

module.exports = router;

