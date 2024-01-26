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
	try {
		const { error } = businessValidation.validateCreateBusiness(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const existed = await businessService.checkExistBusiness(["tax_number"], [req.body.tax_number]);

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

		if (req.file) {
			const tempFolderPath = path.join("storage", "document", "contract_temp");
			if (!fs.existsSync(tempFolderPath)) {
				await fs.promises.mkdir(tempFolderPath, { recursive: true });
			}

			const officialFolderPath = path.join("storage", "document", "contract");
			if (!fs.existsSync(officialFolderPath)) {
				await fs.promises.mkdir(officialFolderPath, { recursive: true });
			}
			
			const tempFilePath = path.join(tempFolderPath, req.file.filename);
			const officialFilePath = path.join(officialFolderPath, req.file.filename);

			await fs.promises.rename(tempFilePath, officialFilePath);
		}
		
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

const updateBusinessInfo = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission !== 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	const { error } = businessValidation.validateFindingBusinessByBusiness(req.query) || businessValidation.validateUpdatingBusiness(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	const businessId = req.query.business_id;

	if (req.body.hasOwnProperty("debit")) {
		const businessUser = (await businessService.getOneBusinessUser(["business_id"], [businessId]))[0];
		req.body["debit"] += parseInt(businessUser["debit"]);
	}

	const keys = Object.keys(req.body);
	const values = Object.values(req.body);

	const conditionFields = ["business_id"];
	const conditionValues = [businessId];

	try {
		const result = await businessService.updateBusinessUser(keys, values, conditionFields, conditionValues);

		if (result[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Khách hàng không tồn tại."
			});
		}

		res.status(201).json({
			error: false,
			message: "Cập nhật thành công.",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const deleteBusinessUser = async (req,res)=>{
	if (!req.isAuthenticated() || req.user.permission !== 2) {
		return res.status(401).json({
			error: true,
			message: "Bạn không có quyền truy cập tài nguyên này.",
		});
	}

	const { error } = businessValidation.validateDeletingBusiness(req.query);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
	const result = await businessService.deleteBusinessUser(["business_id"], [req.query.business_id]);

	if (result[0].affectedRows <= 0) {
		return res.status(200).json({
			error: true,
			message: "Khách hàng không tồn tại.",
		});
	}
	
	return res.status(200).json({
		error: false,
		message: `Xóa khách hàng ${req.query.business_id} thành công.`,
	});
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Đã xảy ra lỗi. Vui lòng thử lại.",
		});
	}
};

const updateContract = async (req, res) => {
	if (!req.file) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
		const business = await businessService.getOneBusinessUser(["business_id"], [req.query.business_id]);
		
		if (!business || business.length <= 0) {
			return res.status(404).json({
				error: true,
				message: "Khách hàng không tồn tại.",
			});
		}

		const oldContractPath = path.join("storage", "document", "contract", business[0]["contract"]);

		fs.unlinkSync(oldContractPath);

		const result = await businessService.updateBusinessUser(["contract"], [req.file.filename], ["business_id"], [req.query.business_id]);

		if (result[0].affectedRows <= 0) {
			return res.status(403).json({
				error: true,
				message: "Khách hàng không tồn tại.",
			});
		}

		const tempFolderPath = path.join("storage", "document", "contract_temp");
		if (!fs.existsSync(tempFolderPath)) {
			await fs.promises.mkdir(tempFolderPath, { recursive: true });
		}

		const officialFolderPath = path.join("storage", "document", "contract");
		if (!fs.existsSync(officialFolderPath)) {
			await fs.promises.mkdir(officialFolderPath, { recursive: true });
		}
			
		const tempFilePath = path.join(tempFolderPath, req.file.filename);
		const officialFilePath = path.join(officialFolderPath, req.file.filename);

		await fs.promises.rename(tempFilePath, officialFilePath);

		res.status(201).json({
			error: false,
			message: "Cập nhật thành công.",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

module.exports = {
	createNewBusinessUser,
	getBusiness,
	checkExistBusiness,
	updateContract,
	updateBusinessInfo,
	deleteBusinessUser,
}