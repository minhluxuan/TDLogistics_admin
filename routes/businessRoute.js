const express = require("express");
const multer = require("multer");
const businessController = require("../controllers/businessController");
const utils = require("../utils");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, done) {
        done(null, 'storage/document/contract_temp');
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
        done(new Error("Tên file quá dài. Tối đa 20 ký tự được cho phép."));
    }

    return done(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

router.post("/create", upload.single("contract"), businessController.createNewBusinessUser);
router.get("/search", businessController.getBusiness);
router.delete("/delete",businessController.deleteBusinessUser);
router.patch("/update", businessController.updateBusinessInfo);
router.patch("/update_contract", utils.isAuthenticated(2), upload.single("contract"), businessController.updateContract);

module.exports = router;