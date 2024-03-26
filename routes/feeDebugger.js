const express = require("express");
const feeDebugger = require("../lib/feeDebugger");
const router = express.Router();

const feeComponent = feeDebugger.CPNdebugger();

router.get("/", (req, res) => {
    res.render("feeDebugger", {feeComponent} );
});

module.exports = router