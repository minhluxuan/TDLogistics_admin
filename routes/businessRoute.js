const express = require("express");
const multer = require("multer");
const businessController = require("../controllers/businessController");
const path = require("path");
const fs = require("fs");
const utils = require("../utils");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, done) {
        const folderPath = path.join("storage", "document", "contract_temp");
        
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

const user =  new utils.User();

router.post("/create", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 11), upload.single("contract"), businessController.createNewBusinessUser);
router.get("/search", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 12), businessController.getBusiness);
router.patch("/update", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 13), businessController.updateBusinessInfo);
router.patch("/update_contract", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 13), upload.single("contract"), businessController.updateContract);
router.delete("/delete", user.isAuthenticated(), user.isAuthorized(3, 5, 7, 9, 14), businessController.deleteBusinessUser);

module.exports = router;
