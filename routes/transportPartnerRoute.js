const express = require("express");
const transportPartnerController = require("../controllers/transportPartnerController");

const router = express.Router();

router.get("/search", transportPartnerController.getTransportPartner);
router.post("/create", transportPartnerController.createNewTransportPartner);
router.patch("/update", transportPartnerController.updateTransportPartner);
router.delete("/delete", transportPartnerController.deleteTransportPartner);

module.exports = router;
