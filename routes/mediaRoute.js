const express = require("express");
const multer = require("multer");
const mediaController = require("../controllers/mediaController");
const utils = require("../utils");
const path = require('path');
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({	
    destination: async function (req, file, done) {
        let folderPath;

        if (file.fieldname === "file")
        {
            folderPath = path.join("storage", "media_temp");

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
        }
        
        return done(null, folderPath);
    },

    filename: function (req, file, done) {
        done(null, file.originalname);
    }
});

const fileFilter = (req, file, done) => {
    if (!file) {
        return done(new Error("File không tồn tại."));
    }

    if (file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg" && file.mimetype && "image/png"
    && file.mimetype !== "application/pdf") 
    { 
       return done(new Error("File không hợp lệ"));
    }

    const maxFileSize = 20 * 1024 * 1024;
    if (file.size > maxFileSize) {
        done(new Error("File có kích thước quá lớn. Tối đa 20MB được cho phép"));
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

router.post("/create", user.isAuthenticated(), user.isAuthorized(2), upload.array("file"), mediaController.createMedia);
router.get("/search", user.isAuthenticated(), user.isAuthorized(2), mediaController.findMedia);
router.get("/searchfile", user.isAuthenticated(), user.isAuthorized(2), mediaController.findFile);

module.exports = router;
