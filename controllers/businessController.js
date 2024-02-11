const businessService = require ("../services/businessService");
const agenciesService = require("../services/agenciesService");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require('path');
const utils = require("../lib/utils");

const businessValidation = new validation.BusinessValidation();

const checkExistBusiness = async (req, res) => {
	try {
		const { error } = businessValidation.validateCheckingExistBusiness(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const existed = await businessService.checkExistBusiness(req.query);
		
		return res.status(200).json({
			error: false,
			existed: existed,
			message: existed ? 
			`Người dùng doanh nghiệp có mã số thuế ${req.query.tax_number} đã tồn tại` :
			`Người dùng doanh nghiệp có mã số thuế ${req.query.tax_number} chưa tồn tại`,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getBusiness = async (req, res) => {
	try {
		if (["ADMIN", "MANAGER"].includes(req.user.role) || req.user.privileges.includes(28)) {
			const { error } = businessValidation.validateFindingBusinessByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: "Thông tin không hợp lệ.",
				});
			}

			const result = await businessService.getManyBusinessUsers(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}

		if (["AGENCY_MANAGER"].includes(req.user.role) || req.user.privileges.includes(27)) {
			const searcherIdSubParts = req.user.staff_id.split('_');
			const businessIdSubParts = req.body.business_id.split('_');

			if (searcherIdSubParts[1] !== businessIdSubParts[1] || req.user.agency_id !== req.body.agency_id) {
				return res.status(404).json({
					error: true,
					message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
				});
			}

			req.body.agency_id = req.user.agency_id;

			const result = await businessService.getManyBusinessUsers(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}

		if (req.user.role === "BUSINESS_USER" || req.user.privileges.includes(26)) {
			const { error } = businessValidation.validateFindingBusinessByBusiness(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			const result = await businessService.getOneBusinessUser(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error,
		});
	}
};

const getRepresentor = async (req, res) => {
	try {
		const { error } = businessValidation.validateFindingRepresentor(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const result = await businessService.getRepresentor(req.body);
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
}

const createNewBusinessUser = async (req, res) => {
	try {
		if (["ADMIN", "MANAGER"].includes(req.user.role)) {
			const { error } = businessValidation.validateCreateBusinessByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (!(await agenciesService.checkExistAgency({ agency_id: req.body.agency_id }))) {
				return res.status(404).json({
					error: true,
					message: `Bưu cục có mã bưu cục ${req.body.agency_id} không tồn tại.`,
				});
			}
		}
		else if (["AGENCY_MANAGER"].includes(req.user.role)) {
			const { error } = businessValidation.validateCreateBusinessByAgency(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			req.body.agency_id = req.user.agency_id;
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

		const agencyIdSubParts = req.body.agency_id.split('_');
		req.body.password = utils.hash(req.body.password);

		const businessId = agencyIdSubParts[0] + '_' + agencyIdSubParts[1] + '_' + req.body.user_cccd;

		const business = new Object({
			business_id: businessId,
			agency_id: req.body.agency_id,
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
	try {
		const { error } = businessValidation.validateQueryUpdatingBusiness(req.query) || businessValidation.validateUpdatingBusiness(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const updatorIdSubParts = req.user.staff_id.split('_');
		const businessIdSubParts = req.query.business_id.split('_');

		if ((req.user.role === "AGENCY_MANAGER" || req.user.privileges.includes(16))
		&& (updatorIdSubParts[1] !== businessIdSubParts[1] || req.user.agency_id !== req.query.agency_id)) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		const resultGettingOneBusiness = await businessService.getOneBusinessUser(req.query);
		if (!resultGettingOneBusiness || resultGettingOneBusiness.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
			});
		}

		const business = resultGettingOneBusiness[0];

		if (req.body.hasOwnProperty("debit")) {
			req.body.debit += business.debit || 0;
		}

		const resultUpdatingBusiness = await businessService.updateBusinessUser(req.body, req.query);

		if (!resultUpdatingBusiness || resultUpdatingBusiness.affectedRows <= 0) {
			return res.status(404).json({
				error: false,
				message: `Kết quả:\n
				Cập nhật thông tin người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thất bại.
				Bưu cục có mã bưu cục ${req.query.business_id} không tồn tại.`,
			});
		}
		else {
			return res.status(201).json({
				error: false,
				message: `Kết quả:\n
				Cập nhật thông tin người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thành công.`,
			});
		}

		
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updateBusinessRepresentor = async (req, res) => {
	const { error } = businessValidation.validateQueryUpdatingBusiness(req.query) || businessValidation.validateUpdatingBusinessRepresentor(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: error.message,
		});
	}

	const updatorIdSubParts = req.user.staff_id.split('_');
	const businessIdSubParts = req.query.business_id.split('_');

	if ((req.user.role === "AGENCY_MANAGER" || req.user.privileges.includes(16))
		&& (updatorIdSubParts[1] !== businessIdSubParts[1] || req.user.agency_id !== agencyId)) {
		return res.status(404).json({
			error: true,
			message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
		});
	}

	if (!(await businessService.checkExistBusiness(req.query))) {
		return res.status(404).json({
			error: true,
			message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
		});
	}

	delete req.query.agency_id;

	if (!(await businessService.checkExistBusinessRepresentor(req.query))) {
		return res.status(404).json({
			error: true,
			message: `Người đại diện doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
		});
	}

	const resultUpdatingBusinessRepresentor = await businessService.updateBusinessRepresentor(req.body, req.query);

	if (!resultUpdatingBusinessRepresentor || resultUpdatingBusinessRepresentor.affectedRows <= 0) {
		return res.status(201).json({
			error: false,
			message: `Kết quả:\n
			Cập nhật thông tin người đại diện doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thất bại.
			Doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
		});
	}
	else {
		return res.status(201).json({
			error: false,
			message: `Kết quả:\n
			Cập nhật thông tin người đại diện doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thành công.`
		});
	}
}

const deleteBusinessUser = async (req, res) => {
	try {
		const { error } = businessValidation.validateDeletingBusiness(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const deletorIdSubParts = req.user.staff_id.split('_');
		const businessIdSubParts = req.query.business_id.split('_');

		if ((req.user.role === "AGENCY_MANAGER" || req.user.privileges.includes(16))
			&& (deletorIdSubParts[1] !== businessIdSubParts[1] || req.user.agency_id !== req.query.agency_id)) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		if (!(await businessService.checkExistBusiness(req.query))) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
			});
		}

		const resultGettingOneBusiness = await businessService.getOneBusinessUser(req.query);
		if (!resultGettingOneBusiness || resultGettingOneBusiness.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
			});
		}

		const business = resultGettingOneBusiness[0];
		const contract = business.contract;

		const resultDeletingOneBusiness = await businessService.deleteBusinessUser(req.query);

		if (!resultDeletingOneBusiness || resultDeletingOneBusiness.affectedRows <= 0) {
			return res.status(200).json({
				error: false,
				message: `Kết quả:\n
				Xóa người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thất bại.
				Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
			});
		}
		
		if (contract) {
			const filePath = path.join("storage", "business_user", "document", "contract", contract);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}

		return res.status(201).json({
			error: false,
			message: `Kết quả:\n
			Xóa người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			status: "error",
			message: "Đã xảy ra lỗi. Vui lòng thử lại.",
		});
	}
};

const updateContract = async (req, res) => {
	try {
		const { error } = businessValidation.validateQueryUpdatingBusiness(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const updatorIdSubParts = req.user.staff_id.split('_');
		const businessIdSubParts = req.query.business_id.split('_');

		if ((req.user.role === "AGENCY_MANAGER" || req.user.privileges.includes(16))
			&& (updatorIdSubParts[1] !== businessIdSubParts[1] || req.user.agency_id !== req.query.agency_id)) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		const resultGettingOneBusiness = await businessService.getOneBusinessUser(req.query);
		if (!resultGettingOneBusiness || resultGettingOneBusiness.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
			});
		}

		const business = resultGettingOneBusiness[0];
		const contract = business.contract;

		if (contract) {
			const oldContractPath = path.join("storage", "business_user", "document", "contract", contract);

			if (fs.existsSync(oldContractPath)) {
				fs.unlinkSync(oldContractPath);
			}
		}

		const resultUpdatingContract = await businessService.updateBusinessUser({ contract: req.file.filename }, req.query);

		if (!resultUpdatingContract|| resultUpdatingContract.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Kết quả:\n
				Cập nhật hợp đồng cho người dùng doanh nghiệp có mã người dùng ${req.query.business_id} không thành công.
				Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
			});
		}

		const tempFolderPath = path.join("storage", "business_user", "document", "contract_temp");
		if (!fs.existsSync(tempFolderPath)) {
			fs.mkdirSync(tempFolderPath, { recursive: true });
		}

		const officialFolderPath = path.join("storage", "business_user", "document", "contract");
		if (!fs.existsSync(officialFolderPath)) {
			fs.mkdirSync(officialFolderPath, { recursive: true });
		}
			
		const tempFilePath = path.join(tempFolderPath, req.file.filename);
		const officialFilePath = path.join(officialFolderPath, req.file.filename);

		fs.renameSync(tempFilePath, officialFilePath);

		res.status(201).json({
			error: false,
			message: `Kết quả:\n
			Cập nhật hợp đồng cho người dùng doanh nghiệp có mã người dùng ${req.query.business_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

module.exports = {
	createNewBusinessUser,
	getBusiness,
	getRepresentor,
	checkExistBusiness,
	updateContract,
	updateBusinessRepresentor,
	updateBusinessInfo,
	deleteBusinessUser,
}