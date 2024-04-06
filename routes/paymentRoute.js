const express = require("express");
require('dotenv').config();

const router = express.Router();

router.get("/payment_successful", (req, res) => {
	try {
        if (!req)

		return res.status(200).json({
			error: false,
			message: "Payment confirmed successfully.",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: false,
			message: error.message,
		});
	}
});

router.get("/cancel_payment", (req, res) => {
	try {
		return res.status(200).json({
			error: false,
			message: "Payment confirmed cancel.",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: false,
			message: error.message,
		});
	}
});

module.exports = router;