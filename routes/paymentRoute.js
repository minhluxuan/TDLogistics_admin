const express = require("express");
require('dotenv').config();
const validation = require("../lib/validation");
const ordersService = require("../services/ordersService");
const paymentService = require("../services/paymentService");

const router = express.Router();

const paymentValidation = new validation.PaymentValidation();

router.get("/payment_successful", async (req, res) => {
	try {
		return res.status(200).json({
			error: false,
			message: "Tạo đơn thành công.",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
})

router.post("/confirm_webhook", async (req, res) => {
	try {
		const resultGettingOneOrder = await ordersService.getOneOrder({ order_code: req.body.data.orderCode });
		if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Lô hàng có mã ${req.body.data.orderCode} không tồn tại.`,
			});
		}

		if (req.body.data.status !== "PAID") {
			return res.status(409).json({
				error: true,
				message: `Đơn hàng ${req.body.data.orderCode} chưa được thanh toán.`,
			});
		}

		if (req.body.data.amountPaid !== resultGettingOneOrder[0].fee) {
			return res.status(409).json({
				error: true,
				message: `Số tiền thanh toán không khớp. Số tiền hợp lệ: ${resultGettingOneOrder[0].fee}.`,
			});
		}

		await ordersService.updateOrder({ paid: true }, { order_code: req.body.data.orderCode });

		return res.status(200).json({
			error: false,
			message: "Thanh toán thành công.",
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

router.post("/create_payment", async (req, res) => {
	try {
		const infoPayment = await paymentService.createPaymentService(req.body.order_id, 5000, "Thanh toán đơn hàng");
		console.log(infoPayment);
		return res.status(200).json({
			message: infoPayment
		})
	}
	catch (error) {
		return res.status(400).json({
			message: error.message
		})
	}
})

module.exports = router;