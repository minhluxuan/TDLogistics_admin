const express = require("express");
const containerController = require("../controllers/containerController");

const router = express.Router();

router.post("/create", containerController.createContainer);
router.post("/update", containerController.updateContainer);
router.get("/search", containerController.getContainer);

module.exports = router;