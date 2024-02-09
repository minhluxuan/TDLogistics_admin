const express = require("express");
const multer = require("multer");
const businessController = require("../controllers/businessController");
const path = require("path");
const fs = require("fs");
const auth = require("../lib/auth");

const router = express.Router();

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

router.get("/check", businessController.checkExistBusiness);
router.post("/create", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "AGENCY_MANAGER"], [29, 30]), upload.single("contract"), businessController.createNewBusinessUser);
router.get("/search", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "BUSINESS_USER"], [26, 27, 28]), businessController.getBusiness);
router.get("/search_representor", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "BUSINESS_USER"], [39]), businessController.getRepresentor);
router.put("/update", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "AGENCY_MANAGER"], [31, 33]), businessController.updateBusinessInfo);
router.patch("/update_business_representor", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "AGENCY_MANAGER"], [32, 34]), businessController.updateBusinessRepresentor);
router.patch("/update_contract", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "AGENCY_MANAGER"], [35, 36]), upload.single("contract"), businessController.updateContract);
router.delete("/delete", auth.isAuthenticated(), auth.isAuthorized(["ADMIN", "MANAGER", "AGENCY_MANAGER"], [37, 38]), businessController.deleteBusinessUser);

module.exports = router;
