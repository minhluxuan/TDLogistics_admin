const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const businessController = require("../controllers/businessController");
const Business = require("../database/Business");
const auth = require("../lib/auth");

const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    const resultGettingOneBusiness = await Business.getOneBusinessUser({ username: username });

    if (resultGettingOneBusiness.length <= 0) {
        done(null, false);
    }

    const business = resultGettingOneBusiness[0];

    if (!business) {
        return done(null, false);
    }

    const passwordFromDatabase = staff.password;
    const match = bcrypt.compareSync(password, passwordFromDatabase);

    if (!match) {
        return done(null, false);
    }

    const business_id = business.staff_id;
    const role = "BUSINESS_USER";
    const active = staff.active;

    return done(null, {
        business_id,
        role,
        active,
    });
});

passport.use("businessLogin", sessionStrategy);

const storage = multer.diskStorage({
    destination: function (req, file, done) {
        const folderPath = path.join("storage", "business_user", "document", "contract_temp");
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        done(null, folderPath);
    },
    filename: function (_req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    },
});

const fileFilter = (req, file, done) => {
    if (!file) {
        return done(new Error("File hợp đồng không tồn tại."));
    }

    if (file.mimetype !== "application/pdf") {
        return done(new Error("Kiểu file không hợp lệ. Chỉ cho phép file PDF."));
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

router.post("/login", passport.authenticate("businessLogin"), (req, res, next) => {
    passport.authenticate("normalLogin", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: true, message: "Xác thực thất bại." });
        }

        return res.status(200).json({ error: false, message: "Xác thực thành công." });
    })(req, res, next);
});
router.get("/check", businessController.checkExistBusiness);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"]),
    upload.single("contract"),
    businessController.createNewBusinessUser
);
router.get(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "BUSINESS_USER"]),
    businessController.getBusiness
);
router.get(
    "/search_representor",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "BUSINESS_USER"]),
    businessController.getRepresentor
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    businessController.updateBusinessInfo
);
router.patch(
    "/update_business_representor",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    businessController.updateBusinessRepresentor
);
router.patch(
    "/update_contract",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    upload.single("contract"),
    businessController.updateContract
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    businessController.deleteBusinessUser
);

module.exports = router;
