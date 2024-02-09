const express = require("express");
const transportPartnerController = require("../controllers/transportPartnerController");
const auth = require("../lib/auth");
const router = express.Router();

router.get("/search", transportPartnerController.getTransportPartner);
router.post(
    "/create",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []),
    transportPartnerController.createNewTransportPartner
);
router.patch(
    "/update",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []),
    transportPartnerController.updateTransportPartner
);
router.delete(
    "/delete",
    auth.isAuthenticated(),
    auth.isAuthorized(["ADMIN", "AGENCY_MANAGER"], []),
    transportPartnerController.deleteTransportPartner
);

module.exports = router;
