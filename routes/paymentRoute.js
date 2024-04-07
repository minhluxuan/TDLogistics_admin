const express = require("express");
require('dotenv').config();
const validation = require("../lib/validation");
const ordersService = require("../services/ordersService");

const router = express.Router();

const paymentValidation = new validation.PaymentValidation();

router.get("/payment_successful", async (req, res) => {
	try {
        const { error } = paymentValidation.validatePaymentResult(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const resultGettingOneOrder = await ordersService.getOneOrder({ order_id: req.body.data.orderCode });
		if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Lô hàng có mã ${req.body.data.orderCode} không tồn tại.`,
			});
		}

		if (req.body.signature !== resultGettingOneOrder[0].signature) {
			return res.status(400).json({
				error: true,
				message: "Chữ ký không khớp.",
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

		await ordersService.updateOrder({ paid: true }, { order_id: req.body.data.orderCode });

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

module.exports = router;