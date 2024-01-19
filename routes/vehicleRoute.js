const vehicleController = require("../controllers/vehicleController");
const express = require("express");
const router = express.Router();

router.post("/create", (req, res) => {
    console.log("oke created");
    res.json({
        status: "created",
    });
});

module.exports = router;
