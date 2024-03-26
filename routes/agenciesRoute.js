const express = require("express");
const agenciesController = require("../controllers/agenciesController");
const auth = require("../lib/auth");
const multer = require("multer");
const path = require('path');
const fs = require("fs");

const storage = multer.diskStorage({	
    destination: async function (req, file, done) {
        let folderPath;

        if (file.fieldname === "files")
        {
            folderPath = path.join("storage", "agency_company", "license_temp");

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

const router = express.Router();

router.get("/check", agenciesController.checkExistAgency);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    agenciesController.createNewAgency
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    agenciesController.updateAgency
);
router.post(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "HUMAN_RESOURCE_MANAGER", "MANAGER", "TELLER", "COMPLAINTS_SOLVER",
    "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"]),
    auth.isActive(),
    agenciesController.getAgencies
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    agenciesController.deleteAgency
);
router.put(
    "/update_agency_company_license",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    upload.array("files"),
    agenciesController.updateLicenseAgencyCompany
);
router.put(
    "/update_agency_company",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"]),
    auth.isActive(),
    agenciesController.updateAgencyCompany
);
router.post(
    "/search_agency_company_license",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "HUMAN_RESOURCE_MANAGER", "MANAGER", "AGENCY_MANAGER"]),
    auth.isActive(),
    agenciesController.getLicenseAgencyCompany
);

module.exports = router;