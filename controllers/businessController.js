const businessService = require ("../services/businessService");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require('path');
const utils = require("../lib/utils");

const businessValidation = new validation.BusinessValidation();

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
				message: error.message,
			});
		}

		if (req.body.tax_number) {
			const existed = await businessService.checkExistBusiness({ tax_number: req.body.tax_number });

			if (existed) {
				return res.status(400).json({
					error: true,
					message: `Doanh nghiệp có mã số thuế ${req.body.tax_number} đã tồn tại.`,
				});
			}
		}

		const creatorIdSubParts = req.user.staff_id.split('_');
		req.body.password = utils.hash(req.body.password);

		const businessId = creatorIdSubParts[0] + '_' + creatorIdSubParts[1] + '_' + req.body.user_cccd;

		const business = new Object({
			business_id: businessId,
			username: req.body.username,
			password: req.body.password,
			business_name: req.body.business_name,
			email: req.body.email,
			phone_number: req.body.phone_number,
			tax_number: req.body.tax_number || null,
			province: req.body.province,
			district: req.body.district,
			town: req.body.town,
			detail_address: req.body.detail_address,
			contract: req.file ? req.file.filename : null,
			bin: req.body.bin,
			bank: req.body.bank,
			active: false,
		});

		const representor = new Object({
			business_id: businessId,
			fullname: req.body.user_fullname,
			phone_number: req.body.user_phone_number,
			email: req.body.user_email,
			phone_number: req.body.user_phone_number,
			date_of_birth: req.body.user_date_of_birth || null,
			cccd: req.body.user_cccd,
			province: req.body.user_province,
			district: req.body.user_district,
			town: req.body.user_town,
			detail_address: req.body.user_detail_address,
			bin: req.body.user_bin || null,
			bank: req.body.bank || null,
		});

		let textResultCreatingNewBusiness;
		const resultCreatingNewBusiness = await businessService.createNewBusinessUser(business);
		if (!resultCreatingNewBusiness || resultCreatingNewBusiness.affectedRows <= 0) {
			textResultCreatingNewBusiness = `
			Tạo người dùng doanh nghiệp có mã doanh nghiệp ${businessId} không thành công.
			Vui lòng tạo thủ công người dùng doanh nghiệp với mã doanh nghiệp ${businessId} và thông tin trên.`;
		}
		else {
			textResultCreatingNewBusiness = `Tạo người dùng doanh nghiệp có mã doanh nghiệp ${businessId} thành công.`;
		}

		let textResultCreatingNewRepresentor;
		const resultCreatingNewRepresentor = await businessService.createNewRepresentor(representor);
		if (!resultCreatingNewRepresentor || resultCreatingNewRepresentor.length <= 0) {
			textResultCreatingNewRepresentor = `
			Tạo người đại diện cho doanh nghiệp có mã doanh nghiệp ${businessId} không thành công.
			Vui lòng tạo thủ công người đại diện cho doanh nghiệp với mã doanh nghiệp ${businessId} và những thông tin trên.`
		}
		else {
			textResultCreatingNewRepresentor = `Tạo người đại diện cho doanh nghiệp có mã doanh nghiệp ${businessId} thành công.`;
		}

		if (req.file) {
			const tempFolderPath = path.join("storage", "business_user", "document", "contract_temp");
			if (!fs.existsSync(tempFolderPath)) {
				fs.mkdirSync(tempFolderPath, { recursive: true });
			}

			const officialFolderPath = path.join("storage", "business_user", "document", "contract_temp");
			if (!fs.existsSync(officialFolderPath)) {
				fs.mkdirSync(officialFolderPath, { recursive: true });
			}
			
			const tempFilePath = path.join(tempFolderPath, req.file.filename);
			const officialFilePath = path.join(officialFolderPath, req.file.filename);

			fs.renameSync(tempFilePath, officialFilePath);
		}
		
		return res.status(201).json({
			error: false,
			message: `Kết quả:\n
			${textResultCreatingNewBusiness}\n
			${textResultCreatingNewRepresentor}`,
		});
	} catch (error) {
		console.log(error);
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