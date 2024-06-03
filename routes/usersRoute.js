const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const usersController = require("../controllers/usersController");
const Users = require("../database/Users");
const auth = require("../lib/auth");
const { OTPValidation } = require("../lib/validation");

const otpValidation = new OTPValidation();
const router = express.Router();

const sessionStrategy = new LocalStrategy({
    usernameField: "phone_number",
    passwordField: "otp",
}, async (phone_number, otp, done) => {
    try {
        const { error } = otpValidation.validateVerifyOTP({ phone_number, otp });
    
        if (error) {
            return done(null, false);
        }

        const valid = await usersController.verifyOTPMiddleware(phone_number, otp);
        if (!valid) {
            return done(null, false);
        }

        const role = "USER";

        const resultGettingOneUser = await Users.getOneUser({ phone_number });
        if (!resultGettingOneUser || resultGettingOneUser.length === 0) {
            const user_id = `TD_00000_${phone_number}`;
            const resultCreatingNewUser = await Users.createNewUser({ user_id, phone_number });
            if (!resultCreatingNewUser || resultCreatingNewUser.affectedRows === 0 ) {
                return done(null, false);
            }

            return done(null, {
                role: role,
                user_id: user_id,
                fullname: null,
                phone_number: phone_number,
            });
        }

        const user = resultGettingOneUser[0];

        if (!user) {
            return done(null, false);
        }

        const user_id = user.user_id;
        const fullname = user.fullname;

        return done(null, {
            role,
            user_id,
            fullname,
            phone_number,
        });
    } catch (error) {
        console.log(error);
        return done(null, false);
    }
});

passport.use("otpLogin", sessionStrategy);

const storage = multer.diskStorage({
    destination: function (req, file, done) {
        if (file.fieldname !== "avatar") {
            return done(new Error('Yêu cầu tên trường phải là "avatar".'));
        }

        const folderPath = path.join(__dirname, "..", "storage", "user", "img", "avatar_temp");
        
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

    if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png" && file.mimetype !== "image/heic") { 
       return done(new Error("Hình ảnh không hợp lệ. Chỉ các file .jpg, .jpeg, .png được cho phép."));
    }

    const maxFileSize = 10 * 1024 * 1024 ;
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
        return res.status(200).json({ error: false, valid: true, message: "Xác thực thành công." });
    })(req, res, next);
});
router.post("/check", usersController.checkExistUser);
router.post("/create", usersController.createNewUser);
router.post("/search", auth.isAuthenticated(), auth.isAuthorized(["USER"]), usersController.getOneUser);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["USER"]), usersController.updateUserInfo);
router.get("/logout", auth.isAuthenticated(), auth.isAuthorized(["USER"]), usersController.logout);

router.get("/get_info", 
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
    "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER", "USER"]),
    usersController.getAuthenticatedUserInfo
);
router.put(
    "/update_avatar",
    auth.isAuthenticated(),
    auth.isAuthorized(["USER"]),
    upload.single("avatar"),
    usersController.updateAvatar
);
router.get(
    "/get_avatar",
    auth.isAuthenticated(),
    auth.isAuthorized(["USER"]),
    usersController.getAvatar
);

module.exports = router;
