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
		const existed = await staffsService.checkExistStaff(Object.keys(req.query), Object.values(req.query));
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
	if (!req.isAuthenticated() || req.user.permission < 1) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	if (req.user.permission == 1) {
		try {
			const { error } = businessValidation.validateFindingBusinessByBusiness(req.query);

			if (error) {
				return res.status(400).json({
					error: true,
					message: "Thông tin không hợp lệ.",
				});
			}

			if (req.user.business_id !== req.query.business_id) {
				return res.status(401).json({
					error: true,
					message: "Bạn không được phép truy cập tài nguyên này.",
				});
			}

			const keys = Object.keys(req.query);
			const values = Object.values(req.query);

			const result = await businessService.getOneBusinessUser (keys, values); 
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		} catch (error) {
			return res.status(500).json({
				error: true,
				message: error.message,
			});
		}
	}

	if (req.user.permission === 3) {
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
			console.error("Error: ", error);
			res.status(500).json({
				error: true,
				message: error,
			});
		}
	}
};

const createNewBusinessUser = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission < 3) {
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

		const result = await businessService.checkExistBusiness(["tax_number"] , [req.body.tax_number]);

		if (result) {
			return res.status(400).json({
				error: true,
				message: "Khách hàng đã tồn tại.",
			});
		}

		req.body.password = utils.hash(req.body.password);

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		if (req.file) {
			keys.push("contact");
			values.push(req.file.filename);
		}

		await staffsService.createNewStaff(keys, values);
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