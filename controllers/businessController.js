const businessService = require ("../services/businessService");
const utils = require("../utils");
const controllerUtils = require("./utils");
const fs = require("fs");
const path = require('path');

const businessValidation = new controllerUtils.BusinessValidation();

const checkExistBusiness = async (req, res) => {
	const { error } = businessValidation.validateCheckingExistBusiness(req.query);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
		const existed = await businessService.checkExistBusiness(Object.keys(req.query), Object.values(req.query));
		
		return res.status(200).json({
			error: false,
			existed: existed,
			message: existed ? "Khách hàng đã tồn tại" : "Khách hàng không tồn tại.",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getBusiness = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission !== 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	const { error } = businessValidation.validateFindingBusinessByAdmin(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	const keys = Object.keys(req.body);
	const values = Object.values(req.body);

	try {
		const result = await businessService.getManyBusinessUsers(keys, values);
		return res.status(200).json({
			error: false,
			data: result,
			message: "Lấy thông tin thành công.",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error,
		});
	}
};

const createNewBusinessUser = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission !== 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	try {
		const { error } = businessValidation.validateCreateBusiness(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const existed = await businessService.checkExistBusiness(["tax_number"] , [req.body.tax_number]);

		if (existed) {
			return res.status(400).json({
				error: true,
				message: "Khách hàng đã tồn tại.",
			});
		}

		req.body.password = utils.hash(req.body.password);

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		if (req.file) {
			keys.push("contract");
			values.push(req.file.filename);
		}

		await businessService.createNewBusinessUser(keys, values);
		
		return res.status(200).json({
			error: false,
			message: "Thêm thành công!",
		});
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};


module.exports = {
	createNewBusinessUser,
	getBusiness,
	checkExistBusiness
}