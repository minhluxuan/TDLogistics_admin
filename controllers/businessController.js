const businessService = require ("../services/businessService");
const agenciesService = require("../services/agenciesService");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require('path');
const utils = require("../lib/utils");

const businessValidation = new validation.BusinessValidation();

const checkExistBusiness = async (req, res) => {
	try {
		const { error } = businessValidation.validateCheckingExistBusiness(req.body);

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
		const paginationConditions = { rows: 0, page: 0 };

		if (req.query.rows) {
			paginationConditions.rows = parseInt(req.query.rows);
		}

		if (req.query.page) {
			paginationConditions.page = parseInt(req.query.page);
		}

		const { error: paginationError } = businessValidation.validatePaginationConditions(paginationConditions);
		if (paginationError) {
			return res.status(400).json({
				error: true,
				message: paginationError.message,
			});
		}

		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role)) {
			const { error } = businessValidation.validateFindingBusinessByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			const result = await businessService.getManyBusinessUsers(req.body, paginationConditions);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(req.user.role)) {
			const { error } = businessValidation.validateFindingBusinessByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			req.body.agency_id = req.user.agency_id;

			const result = await businessService.getManyBusinessUsers(req.body, paginationConditions);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}

		if (["BUSINESS"].includes(req.user.role)) {
			const { error } = businessValidation.validateFindingBusinessByBusiness(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}
			
			if (req.body.business_id !== req.user.business_id) {
				return res.status(403).json({
					error: true,
					message: "Người dùng không được phép truy cập tài nguyên này.",
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
		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role)) {
			const { error } = businessValidation.validateFindingRepresentorByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			const result = await businessService.getManyRepresentors(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(req.user.role)) {
			const { error } = businessValidation.validateFindingRepresentorByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}
			
			req.body.agency_id = req.user.agency_id;

			const result = await businessService.getManyRepresentors(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}

		if (["BUSINESS"].includes(req.user.role)) {
			const { error } = businessValidation.validateFindingRepresentorByBusiness(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (req.body.business_id !== req.user.business_id) {
				return res.status(403).json({
					error: true,
					message: "Người dùng không được phép truy cập tài nguyên này.",
				});
			}

			const result = await businessService.getOneRepresentor(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const signup = async (req, res) => {
	try {
		const { error } = businessValidation.validateSigningUp(req.body);
		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message
			});
		}

		const business = new Object({
			business_id: "TD_00000_" + req.body.user_cccd,
			agency_id: "TD_00000_077165007713",
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
			approved: false
		});

		const representor = new Object({
			business_id: "TD_00000_" + req.body.user_cccd,
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
			Tạo người dùng doanh nghiệp không thành công.`;
		}
		else {
			textResultCreatingNewBusiness = `Tạo người dùng doanh nghiệp thành công.`;
		}

		let textResultCreatingNewRepresentor;
		const resultCreatingNewRepresentor = await businessService.createNewRepresentor(representor);
		if (!resultCreatingNewRepresentor || resultCreatingNewRepresentor.length <= 0) {
			textResultCreatingNewRepresentor = `
			Tạo người đại diện cho doanh nghiệp không thành công.`
		}
		else {
			textResultCreatingNewRepresentor = `Tạo người đại diện cho doanh nghiệp thành công.`;
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
}

const createNewBusinessUser = async (req, res) => {
	try {
		if (["ADMIN", "MANAGER", "TELLER"].includes(req.user.role)) {
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
		else if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
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
			approved: false
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
			Tạo người dùng doanh nghiệp có mã doanh nghiệp ${businessId} không thành công.`;
		}
		else {
			textResultCreatingNewBusiness = `Tạo người dùng doanh nghiệp có mã doanh nghiệp ${businessId} thành công.`;
		}

		let textResultCreatingNewRepresentor;
		const resultCreatingNewRepresentor = await businessService.createNewRepresentor(representor);
		if (!resultCreatingNewRepresentor || resultCreatingNewRepresentor.length <= 0) {
			textResultCreatingNewRepresentor = `
			Tạo người đại diện cho doanh nghiệp có mã doanh nghiệp ${businessId} không thành công.`
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

const approveNewBusiness = async (req, res) => {
	try {
		const { error: error1 } = businessValidation.validateQueryUpdatingBusiness(req.query);

		if (error1) {
			return res.status(400).json({
				error: true,
				message: error1.message,
			});
		}

		const { error: error2 } = businessValidation.validateApprovingNewBusiness(req.body);

		if (error2) {
			return res.status(400).json({
				error: true,
				message: error2.message,
			});
		}

		const resultCheckingExistAgency = await agenciesService.checkExistAgency(req.body);
		if (!resultCheckingExistAgency) {
			return res.status(404).json({
				error: true,
				message: `Bưu cục có mã ${req.body.agency_id} không tồn tại.`,
			});
		}

		const resultGettingOneBusinessRepresentor = await businessService.getOneRepresentor(req.query);
		if(!resultGettingOneBusinessRepresentor || resultGettingOneBusinessRepresentor.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Khách hàng doanh nghiệp có mã ${req.query.business_id} không tồn tại.`,
			});
		}

		const resultGettingOneBusiness = await businessService.getOneBusinessUser(req.query);
		if(!resultGettingOneBusiness || resultGettingOneBusiness.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Khách hàng doanh nghiệp có mã ${req.query.business_id} không tồn tại.`,
			});
		}

		if (resultGettingOneBusiness[0].approved) {
			return res.status(409).json({
				error: true,
				message: `Khách hàng doanh nghiệp có mã ${req.query.business_id} đã được phê duyệt trước đó.`,
			});
		}

		const agencyIdSubParts = req.body.agency_id.split('_');
		req.body.business_id = agencyIdSubParts[0] + '_' + agencyIdSubParts[1] + '_' + resultGettingOneBusinessRepresentor[0].cccd;
		req.body.active = true;
		req.body.approved = true;

		const resultUpdatingBusiness = await businessService.updateBusinessUser(req.body, req.query);
		if (!resultUpdatingBusiness || resultUpdatingBusiness.affectedRows === 0) {
			return res.status(404).json({
				error: true,
				message: `Khách hàng doanh nghiệp có mã ${req.query.business_id} không tồn tại.`,
			});
		}

		return res.status(201).json({
			error: false,
			message: `Phê duyệt khách hàng doanh nghiệp có mã ${req.body.business_id} thành công.
			Đã chuyển giao quyền quản lý khách hàng doanh nghiệp cho bưu cục có mã ${req.body.agency_id}.`,
		});
		
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

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

		if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)
			&& (updatorIdSubParts[0] !== businessIdSubParts[0]
			|| updatorIdSubParts[1] !== businessIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
			});
		}

		const propertiesWillBeCheckExist = ["email", "phone_number", "bin"];
		const tempUser = new Object();

		for (const prop of propertiesWillBeCheckExist) {
			if (req.body.hasOwnProperty(prop) && req.body[prop]) {
				tempUser[prop] = req.body[prop];
			}
		}

		if (Object.keys(tempUser).length > 0) {
			const resultCheckingExistBusiness = await businessService.checkExistBusinessUnion(tempUser);
			
			if (resultCheckingExistBusiness.existed) {
				return res.status(409).json({
					error: true,
					message: resultCheckingExistBusiness.message,
				});
			}
		}

		if (req.body.hasOwnProperty("debit")) {
			const resultGettingOneBusiness = await businessService.getOneBusinessUser(req.query);
			if (!resultGettingOneBusiness || resultGettingOneBusiness.length <= 0) {
				return res.status(404).json({
					error: true,
					message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
				});
			}

			const business = resultGettingOneBusiness[0];
			req.body.debit = parseFloat(req.body.debit);
			req.body.debit += parseFloat(business.debit) || 0;
		}

		const resultUpdatingBusiness = await businessService.updateBusinessUser(req.body, req.query);

		if (!resultUpdatingBusiness || resultUpdatingBusiness.affectedRows <= 0) {
			return res.status(404).json({
				error: false,
				message: `Bưu cục có mã bưu cục ${req.query.business_id} không tồn tại.`,
			});
		}

		return res.status(201).json({
			error: false,
			message: `Cập nhật thông tin người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thành công.`,
		});
		
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

	if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)
		&& (updatorIdSubParts[0] !== businessIdSubParts[0]
		|| updatorIdSubParts[1] !== businessIdSubParts[1])) {
		return res.status(404).json({
			error: true,
			message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
		});
	}

	if (!(await businessService.checkExistBusiness(req.query))) {
		return res.status(404).json({
			error: true,
			message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
		});
	}

	if (!(await businessService.checkExistBusinessRepresentor(req.query))) {
		return res.status(404).json({
			error: true,
			message: `Người đại diện doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
		});
	}

	const propertiesWillBeCheckExist = ["phone_number", "email", "cccd", "bin"];

	const tempUser = new Object();

	for (const prop of propertiesWillBeCheckExist) {
		if (req.body.hasOwnProperty(prop) && req.body[prop]) {
			tempUser[prop] = req.body[prop];
		}
	}

	if (Object.keys(tempUser).length > 0) {
		const resultCheckingExistBusinessRepresentor = await businessService.checkExistBusinessRepresentor(tempUser);
		
		if (resultCheckingExistBusinessRepresentor.existed) {
			return res.status(409).json({
				error: true,
				message: resultCheckingExistBusinessRepresentor.message,
			});
		}
	}

	const resultUpdatingBusinessRepresentor = await businessService.updateBusinessRepresentor(req.body, req.query);

	if (!resultUpdatingBusinessRepresentor || resultUpdatingBusinessRepresentor.affectedRows <= 0) {
		return res.status(201).json({
			error: false,
			message: `Doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`
		});
	}

	return res.status(201).json({
		error: false,
		message: `Cập nhật thông tin người đại diện doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thành công.`
	});
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

		const updatorIdSubParts = req.user.staff_id.split('_');
		const businessIdSubParts = req.query.business_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)
			&& (updatorIdSubParts[0] !== businessIdSubParts[0]
			|| updatorIdSubParts[1] !== businessIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
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
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
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
			message: `Xóa người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} thành công.`,
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

		if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)
			&& (updatorIdSubParts[0] !== businessIdSubParts[0]
			|| updatorIdSubParts[1] !== businessIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
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
				message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
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
			message: `Cập nhật hợp đồng cho người dùng doanh nghiệp có mã người dùng ${req.query.business_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getBusinessContract = async (req, res) => {
	try {
		const { error } = businessValidation.validateGettingBusinessContract(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const resultGettingOneBusiness = await businessService.getOneBusinessUser(req.body);
			if (!resultGettingOneBusiness || resultGettingOneBusiness.length <= 0) {
				return res.status(404).json({
					error: true,
					message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
				});
			}
			const business = resultGettingOneBusiness[0];
			const contract = business.contract ? business.contract : null;

			if (contract) {
				const filePath = path.join(__dirname, "..", "storage", "business_user", "document", "contract", contract);
				if (fs.existsSync(filePath)) {
					return res.status(200).sendFile(filePath);
				}
			}

			return res.status(404).json({
				error: true,
				message: `File hợp đồng của khách hàng doanh nghiệp có mã ${req.query.business_id} không tồn tại.`,
			});	
		}

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			req.body.agency_id = req.user.agency_id;

			const resultGettingOneBusiness = await businessService.getOneBusinessUser(req.query);
			if (!resultGettingOneBusiness || resultGettingOneBusiness.length <= 0) {
				return res.status(404).json({
					error: true,
					message: `Người dùng doanh nghiệp có mã doanh nghiệp ${req.query.business_id} không tồn tại.`,
				});
			}

			const business = resultGettingOneBusiness[0];
			const contract = business.contract || null;
			
			if (contract) {
				const filePath = path.join(__dirname, "..","storage", "business_user", "document", "contract", contract);
				if (fs.existsSync(filePath)) {
					return res.status(200).sendFile(filePath);
				}
			}

			return res.status(404).json({
				error: true,
				message: `File hợp đồng của khách hàng doanh nghiệp có mã ${req.query.business_id} không tồn tại.`,
			});			
		}

		if (["BUSINESS"].includes(req.user.role)) {
			if (req.body.business_id !== req.user.business_id) {
				return res.status(403).json({
					error: true,
					message: "Người dùng không được phép truy cập tài nguyên này.",
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
			const contract = business.contract ? business.contract : null;
			
			if (contract) {
				const filePath = path.join(__dirname, "..", "storage", "business_user", "document", "contract", contract);
				if (fs.existsSync(filePath)) {
					return res.status(200).sendFile(filePath);
				}
			}

			return res.status(404).json({
				error: true,
				message: `File hợp đồng của khách hàng doanh nghiệp có mã ${req.query.business_id} không tồn tại.`,
			});			
		}
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updatePassword = async (req, res) => {
	try {
		const { error } = businessValidation.validateUpdatePassword(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
		
		const updatedInfo = new Object({
			password: utils.hash(req.body.new_password),
			active: true,
		});

		const result = await businessService.updatePassword(updatedInfo, { business_id: req.user.business_id });
		
		if (!result || result.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Người dùng doanh nghiệp có mã ${req.user.staff_id} không tồn tại.`,
			});
		}

		return res.status(201).json({
			error: false,
			message: "Cập nhật mật khẩu thành công.",
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
	getRepresentor,
	checkExistBusiness,
	updateContract,
	updateBusinessRepresentor,
	updateBusinessInfo,
	deleteBusinessUser,
	getBusinessContract,
	updatePassword,
	signup,
	approveNewBusiness,
}