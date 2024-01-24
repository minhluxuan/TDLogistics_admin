const express = require("express");
const containerController = require("../controllers/containersController");

const router = express.Router();

router.get("/search", (req, res) => {
    res.send("oke");
});

module.exports = router;
