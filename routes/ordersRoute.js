const express = require("express");
const ordersController = require("../controllers/ordersController");
const auth = require("../lib/auth");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({	
    destination: async function (req, file, done) {
        const folderPath = path.join("storage", "business_user", "document", "orders_temp");
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

    if (file.mimetype === "application/vnd.ms-excel") { 
       return done(new Error("File không hợp lệ. Chỉ cho phép file .xlsx"));
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

const orderImagesStorage = multer.diskStorage({	
    destination: async function (req, file, done) {
        const folderPath = path.join("storage", "order", "image", "order_temp");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        return done(null, folderPath);
    },

    filename: function (req, file, done) {
        done(null,  Date.now() + "_" + file.originalname);
    }
});

const orderImagesFileFilter = (req, file, done) => {
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

const orderImagesUpload = multer({
    storage: orderImagesStorage,
    fileFilter: orderImagesFileFilter,
});

router.get(
    "/check",
    ordersController.checkExistOrder
);
router.post(
    "/search",
    auth.isAuthenticated(),
    auth.isAuthorized(["USER", "BUSINESS", "ADMIN", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER", 
    "AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER", 
    "AGENCY_SHIPPER", "PARTNER_SHIPPER", "SHIPPER"]),
    ordersController.getOrders);
router.post(
    "/calculatefee",
    auth.isAuthenticated(),
    auth.isAuthorized(["USER", "ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    ordersController.calculateServiceFee
)
router.post(
    "/check_file_format",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    upload.single("file"),
    ordersController.checkFileFormat
);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["USER", "ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    ordersController.createNewOrder
);
router.post(
    "/create_by_file",
    auth.isAuthenticated(),
    auth.isAuthorized(["USER", "ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    upload.single("file"),
    ordersController.createOrdersByFile,
);
router.put(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER", "SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"]),
    ordersController.updateOrder
);
router.delete(
    "/cancel",
    auth.isAuthenticated(),
    auth.isAuthorized(["USER", "ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]),
    ordersController.cancelOrder
);
router.post("/calculate_fee", ordersController.calculateServiceFee);
router.get("/", (req, res) => {
    res.render("order");
});
router.post("/update_images", auth.isAuthenticated(), auth.isAuthorized(["SHIPPER", "AGENCY_SHIPPER"]), auth.isActive(), orderImagesUpload.array("files", 2), ordersController.updateImages);
router.get("/get_images", auth.isAuthenticated(), auth.isActive(), ordersController.getImages);
//router.post("/agency_create", ordersController.createOrderForAgency);

module.exports = router;
