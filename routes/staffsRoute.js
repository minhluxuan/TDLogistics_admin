const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const eventManager = require("../lib/eventManager");
const staffsController = require("../controllers/staffsController");
const auth = require("../lib/auth");
const Staffs = require("../database/Staffs");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    try {
        const resultGettingOneStaff = await Staffs.getOneStaff({ username: username });

        if (resultGettingOneStaff.length <= 0) {
            done(null, false);
        }

        const staff = resultGettingOneStaff[0];

        if (!staff) {
            return done(null, false);
        }

        const passwordFromDatabase = staff.password;
        const match = bcrypt.compareSync(password, passwordFromDatabase);

        if (!match) {
            return done(null, false);
        }

        const staff_id = staff.staff_id;
        const agency_id = staff.agency_id;
        const role = staff.role;
        const privileges = staff.privileges ? JSON.parse(staff.privileges) : new Array();
        const active = staff.active;

        return done(null, {
            staff_id,
            agency_id,
            role,
            privileges,
            active,
        });
    } catch (error) {
        console.log(error);
        done(error);
    }
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

router.post("/login", passport.authenticate("normalLogin"), (req, res, next) => {
    passport.authenticate("normalLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: true, valid: false, message: "Xác thực thất bại." });
        }

        return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
    })(req, res, next);
});
router.get(
    "/get_info",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    staffsController.getAuthenticatedStaffInfo
);
router.post(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    staffsController.getStaffs
);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    upload.single("avatar"),
    staffsController.createNewStaff
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    staffsController.updateStaffInfo
);
router.patch(
    "/update_password",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    staffsController.updatePassword
);
router.patch(
    "/update_avatar",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    upload.single("avatar"),
    staffsController.updateAvatar
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    staffsController.deleteStaff
);
router.get("/logout",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    staffsController.logout);
router.get("/login", (req, res) => {
    res.render("staffLogin");
});
router.get("/", (req, res) => {
    res.render("staff");
})

module.exports = router;
