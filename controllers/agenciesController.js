const agenciesService = require ("../services/agenciesService");
const staffsService = require("../services/staffsService");
const agencyCompanyService = require("../services/agenciesCompanyService");
const logger = require("../lib/logger");
const utils = require("../lib/utils");
const validation = require("../lib/validation");
const archiver = require("archiver");
const randomstring = require("randomstring");
const mailService = require("../services/mailService");
const path = require("path");
const fs = require("fs");
const agencyValidation = new validation.AgencyValidation();

const agencyCannotBeAffected = ["TD_00000_077165007713"];

const checkExistAgency = async (req, res) => {
	try {
		const { error } = agencyValidation.validateCheckingExistAgency(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const existed = await agenciesService.checkExistAgency(req.query);
		return res.status(200).json({
			error: false,
			existed: existed,
			message: existed ? `Bưu cục có mã bưu cục ${req.query.agency_id} đã tồn tại.` : `Bưu cục có mã bưu cục ${req.query.agency_id} chưa tồn tại.`,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getAgencies = async (req, res) => {
	try {
		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_DRIVER", "AGENCY_SHIPPER",].includes(req.user.role)) {
		const { error } = agencyValidation.validateFindingAgencyByAgency(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
  
		req.body.agency_id = req.user.agency_id;

		let result = await agenciesService.getOneAgency(req.body);

		if (!result) {
		  throw new Error("Đã xảy ra lỗi. Lấy thông tin bưu cục không thành công. Vui lòng thử lại.");
		}

		result[0].managed_wards = result[0].managed_wards ? JSON.parse(result[0].managed_wards) : new Array();

		if (result[0].individual_company)
		{
			const agencyCompanyInfo = await agencyCompanyService.getOneAgencyCompany(req.body);
			if (!agencyCompanyInfo) {
				throw new Error(
					"Đã xảy ra lỗi. Lấy thông tin doanh nghiệp không thành công. Vui lòng thử lại."
				);
			}
			result.company_name = agencyCompanyInfo[0].company_name;
			result.tax_number = agencyCompanyInfo[0].tax_number;
			result.license = agencyCompanyInfo[0].license ? JSON.parse(agencyCompanyInfo[0].license) : new Array();
		}
  
		return res.status(200).json({
				error: false,
				data: result,
				message: `Lấy thông tin bưu cục thành công.`,
			});
		}
  
		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",].includes(req.user.role) || req.user.privileges.includes(2)) {
			const paginationConditions = { rows: 0, page: 0 };

			if (req.query.rows) {
			  	paginationConditions.rows = parseInt(req.query.rows);
			}

			if (req.query.page) {
			  	paginationConditions.page = parseInt(req.query.page);
			}

			const { error: paginationError } = agencyValidation.validatePaginationConditions(paginationConditions);
			if (paginationError) {
				return res.status(400).json({
					error: true,
					message: paginationError.message,
				});
			}
  
			const { error } = agencyValidation.validateFindingAgencyByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}
  
			const agenciesInfo = await agenciesService.getAgencies(req.body, paginationConditions);

			if (!agenciesInfo) {
			  	throw new Error("Đã xảy ra lỗi. Lấy thông tin đại lý không thành công. Vui lòng thử lại.");
			}

			for (const agency of agenciesInfo) {
				if (agency.managed_wards) {
					agency.managed_wards = JSON.parse(agency.managed_wards);
				} 
				else {
					agency.managed_wards = new Array();
				}

				if (agency.individual_company)
				{
					const agencyCompanyInfo = await agencyCompanyService.getOneAgencyCompany({agency_id : agency.agency_id});
					if (!agencyCompanyInfo) {
						throw new Error("Đã xảy ra lỗi. Lấy thông tin doanh nghiệp không thành công. Vui lòng thử lại.");
					}
					if (agencyCompanyInfo.length > 0) {
						agency.company_name = agencyCompanyInfo[0].company_name;
						agency.tax_number = agencyCompanyInfo[0].tax_number;
						agency.license = agencyCompanyInfo[0].license ? JSON.parse(agencyCompanyInfo[0].license) : new Array();
					}
			  	}
			}

			return res.status(200).json({
				error: false,
				data: agenciesInfo,
				message: "Lấy thông tin đại lý thành công.",
			});
		}
	} 
	catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const createNewAgency = async (req, res) => {
	try {
		const { error } = agencyValidation.validateCreatingAgency(req.body);

		if (error) {
			console.log(error);
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
  
		const checkingPostalCode = await agenciesService.checkPostalCode( req.body.province, req.body.district, req.body.postal_code);

		if (!checkingPostalCode.success) {
			return res.status(400).json({
				error: true,
				message: checkingPostalCode.message,
			});
		}

		const checkingWardOccupation = await agenciesService.checkWardsOccupation(req.body.province, req.body.district, req.body.managed_wards);

		if (!checkingWardOccupation.success) {
			return res.status(409).json({
				error: true,
				message: checkingWardOccupation.message,
			});
		}

		const tempUser = new Object({
			username: req.body.username,
			cccd: req.body.user_cccd,
			phone_number: req.body.user_phone_number,
			email: req.body.user_phone_number,
		});
  
		const resultCheckingExistStaff = await staffsService.checkExistStaff(tempUser);

		if (resultCheckingExistStaff.existed) {
			return res.status(409).json({
				error: true,
				message: resultCheckingExistStaff.message,
			});
		}

		if (req.body.individual_company) 
		{
			const tempAgencyCompany = new Object({
				company_name: req.body.company_name || undefined,
				tax_number: req.body.tax_number || undefined,
			});

			const { error } = agencyValidation.validateCreatingAgencyCompany(tempAgencyCompany);

			if (error) {
				console.log(error);
				return res.status(400).json({
					error: true,
					message: error.message,
				});
		  	}

			const resultCheckingExistAgencyCompany = await agencyCompanyService.checkExistAgencyCompany(tempAgencyCompany);

			if (resultCheckingExistAgencyCompany.existed) {
				return res.status(409).json({
					error: true,
					message: resultCheckingExistAgencyCompany.message,
				});
			}
		}

		const agencyId = req.body.type + "_" + req.body.postal_code + "_" + req.body.user_cccd;

		const defaultUsername = req.body.email.split('@')[0];
		let username;
		while (true) {
			const randomString = randomstring.generate({
				length: 4,
				charset: "numeric",
				min: 1000,
				max: 9999,
			});
			username = defaultUsername + randomString;

			if (!(await staffsService.checkExistStaff({ username })).existed) {
				break;
			}
		}

		const password = randomstring.generate({
			length: 8,
			charset: 'alphanumeric',
		});
		const hashedPassword = utils.hash(password);

		const newStaff = new Object({
			agency_id: agencyId,
			staff_id: agencyId,
			username: username,
			password: hashedPassword,
			fullname: req.body.user_fullname || null,
			phone_number: req.body.user_phone_number || null,
			email: req.body.user_email || null,
			date_of_birth: req.body.user_date_of_birth || null,
			cccd: req.body.user_cccd || null,
			province: req.body.user_province || null,
			district: req.body.user_district || null,
			town: req.body.town || null,
			detail_address: req.body.user_detail_address || null,
			role: "AGENCY_MANAGER",
			position: req.body.user_position || null,
			bin: req.body.user_bin || null,
			bank: req.body.user_bank || null,
			salary: req.body.salary || null,
			active: false,
		});

		const newAgency = new Object({
			level: req.body.level,
			agency_id: agencyId,
			postal_code: req.body.postal_code,
			agency_name: req.body.agency_name,
			province: req.body.province,
			district: req.body.district,
			town: req.body.town,
			detail_address: req.body.detail_address,
			latitude: req.body.latitude,
			longitude: req.body.longitude,
			managed_wards: req.body.managed_wards
				? JSON.stringify(req.body.managed_wards)
				: JSON.stringify(new Array()),
			phone_number: req.body.phone_number,
			email: req.body.email,
			commission_rate: req.body.commission_rate,
			bin: req.body.bin || null,
			bank: req.body.bank || null,
			individual_company: req.body.individual_company
		});

		const resultCreatingNewAgency = await agenciesService.createNewAgency(newAgency);

		let textResultCreatingNewAgency;
		if (!resultCreatingNewAgency || resultCreatingNewAgency.affectedRows <= 0) {
		  	textResultCreatingNewAgency = `Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thất bại.`;
		} 
		else {
		  	textResultCreatingNewAgency = `Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thành công.`;
		}

		const resultCreatingNewStaff = await staffsService.createNewStaff(newStaff);

		let textResultCreatingNewStaff;
		if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
		  	textResultCreatingNewStaff = `Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thất bại.`;
		} 
		else {
		  	textResultCreatingNewStaff = `Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thành công.`;
		}

		const resultCreatingTablesForAgency = await agenciesService.createTablesForAgency(req.body.postal_code);
		const textResultCreatingTablesForAgency = resultCreatingTablesForAgency.message;

		const resultLocatingAgencyInArea = await agenciesService.locateAgencyInArea(
			0,
			req.body.province,
			req.body.district,
			req.body.managed_wards,
			agencyId,
			req.body.postal_code
		);

		const textResultLocatingAgencyInArea = resultLocatingAgencyInArea.message;

		if (req.body.individual_company) {
			let licenseseImgs = new Array();
			if (req.files)
			{	
				req.files.forEach((file) => {
					licenseseImgs.push(file.filename);
				});
			}

			const newAgencyComapany = new Object({
				agency_id: agencyId,
				company_name: req.body.company_name,
				tax_number: req.body.tax_number,
				license: JSON.stringify(licenseseImgs)
			});

			const resultCreatingNewAgencyCompany = await agencyCompanyService.createNewAgencyCompany(newAgencyComapany);

			let textResultCreatingNewAgencyCompany;
			if (!resultCreatingNewAgencyCompany || resultCreatingNewAgencyCompany.affectedRows <= 0) {
				textResultCreatingNewAgencyCompany = `Tạo bưu cục doanh nghiệp có mã bưu cục ${agencyId} trong cơ sở dữ liệu agency_company thất bại.`;
			} 
			else {
				textResultCreatingNewAgencyCompany = `Tạo bưu cục doanh nghiệp có mã bưu cục ${agencyId} trong cơ sở dữ liệu agency_company thành công.`;
			}

			if (req.files) {
				const tempLicenseFolder = path.join("storage", "agency_company", "license_temp");
				if (!fs.existsSync(tempLicenseFolder)) {
					fs.mkdirSync(tempLicenseFolder, { recursive: true });
				}	

				const officialFolderLicensePath = path.join("storage", "agency_company", "license", `${agencyId}`);
				if (!fs.existsSync(officialFolderLicensePath)) {
					fs.mkdirSync(officialFolderLicensePath, { recursive: true });
				}

				req.files.forEach(file => {
					const tempLicenseFilePath = path.join(tempLicenseFolder, file.fileName);
					if (fs.existsSync(tempLicenseFilePath)) {
						const officialLicenseFilePath = path.join(officialFolderLicensePath, file.fileName);
						fs.renameSync(tempLicenseFilePath, officialLicenseFilePath);
					}
				});
		  	}

			mailService.sendMail({
				from: process.env.MAIL_AUTH_USER,
				to: req.body.user_email,
				subject: "Cung cấp thông tin tài khoản đại lý cho ứng dụng TDlogistics",
				text: "Xin chào " + req.body.user_fullname + ", công ty Chuyển phát nhanh TDlogistics rất hân hạnh được hợp tác với bạn. " + 
				"Dưới đây là thông tin tài khoản cho đại lý của bạn:\n\n" + 
				"username: " + username + '\n' +
				"password: " + password + '\n' +
				"Lưu ý: Vui lòng đổi mật khẩu để kích hoạt tài khoản."
			});

			return res.status(200).json({
				error: false,
				message: 
					`Kết quả:\n
					${textResultCreatingNewStaff}\n
					${textResultCreatingNewAgency}\n
					${textResultCreatingTablesForAgency}\n
					${textResultLocatingAgencyInArea}\n
					${textResultCreatingNewAgencyCompany}`,
			});
		}

		mailService.sendMail({
			from: process.env.MAIL_AUTH_USER,
			to: req.body.user_email,
			subject: "Cung cấp thông tin tài khoản đại lý cho ứng dụng TDlogistics",
			text: "Xin chào " + req.body.user_fullname + ", công ty Chuyển phát nhanh TDlogistics rất hân hạnh được hợp tác với bạn. " + 
			"Dưới đây là thông tin tài khoản cho đại lý của bạn:\n\n" + 
			"username: " + username + '\n' +
			"password: " + password + '\n' +
			"Lưu ý: Vui lòng đổi mật khẩu để kích hoạt tài khoản."
		});

		return res.status(200).json({
			error: false,
			message: `
			Kết quả:\n
			${textResultCreatingNewStaff}\n
			${textResultCreatingNewAgency}\n
			${textResultCreatingTablesForAgency}\n
			${textResultLocatingAgencyInArea}`,
		});
	} 
	catch (error) {
		console.log(error);
		 return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
  };

const createNewAgencyOld = async (req, res) => {
	try {
		const { error } = agencyValidation.validateCreatingAgency(req.body);

		if (error) {console.log(error);
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const checkingPostalCode = await agenciesService.checkPostalCode(req.body.province, req.body.district, req.body.postal_code);
	
		if (!checkingPostalCode.success) {
			return res.status(400).json({
				error: true,
				message: checkingPostalCode.message,
			});
		}

		const checkingWardOccupation = await agenciesService.checkWardsOccupation(req.body.province, req.body.district, req.body.managed_wards);
		if (!checkingWardOccupation.success) {
			return res.status(409).json({
				error: true,
				message: checkingWardOccupation.message,
			});
		}

		const tempUser = new Object({
            username: req.body.username,
            cccd: req.body.user_cccd,
            phone_number: req.body.user_phone_number,
            email: req.body.user_phone_number,
        });

		const resultCheckingExistStaff = await staffsService.checkExistStaff(tempUser);

		if (resultCheckingExistStaff.existed) {
			return res.status(409).json({
				error: true,
				message: resultCheckingExistStaff.message,
			});
		}

		const agencyId = req.body.type + '_' + req.body.postal_code + '_' + req.body.user_cccd;

		req.body.user_password = utils.hash(req.body.user_password);

		const newStaff = new Object({
			agency_id: agencyId,
			staff_id: agencyId,
			username: req.body.username,
			password: req.body.user_password,
			fullname: req.body.user_fullname || null,
			phone_number: req.body.user_phone_number || null,
			email: req.body.user_email || null,
			date_of_birth: req.body.user_date_of_birth || null,
			cccd: req.body.user_cccd || null,
			province: req.body.user_province || null,
			district: req.body.user_district || null,
			town: req.body.town || null,
			detail_address: req.body.user_detail_address || null,
			role: "AGENCY_MANAGER",
			position: req.body.user_position || null,
			bin: req.body.user_bin || null,
			bank: req.body.user_bank || null,
			salary: req.body.salary || null,
			active: false,
		});

		const newAgency = new Object({
			level: req.body.level,
			agency_id: agencyId,
			postal_code: req.body.postal_code,
			agency_name: req.body.agency_name,
			province: req.body.province,
			district: req.body.district,
			town: req.body.town,
			detail_address: req.body.detail_address,
			latitude: req.body.latitude,
			longitude: req.body.longitude,
			managed_wards: req.body.managed_wards ? JSON.stringify(req.body.managed_wards) : JSON.stringify(new Array()),
			phone_number: req.body.phone_number,
			email: req.body.email,
			commission_rate: req.body.commission_rate,
			bin: req.body.bin || null,
			bank: req.body.bank || null,
		});

		const resultCreatingNewAgency = await agenciesService.createNewAgency(newAgency);

		let textResultCreatingNewAgency;
		if (!resultCreatingNewAgency || resultCreatingNewAgency.affectedRows <= 0) {
			textResultCreatingNewAgency = `Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thất bại.`;
		}
		else {
			textResultCreatingNewAgency = `Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thành công.`
		}

		const resultCreatingNewStaff = await staffsService.createNewStaff(newStaff);
		
		let textResultCreatingNewStaff;
		if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
			textResultCreatingNewStaff = `
			Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thất bại.`;
		}
		else {
			textResultCreatingNewStaff = `Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thành công.`
		}

		const resultCreatingTablesForAgency = await agenciesService.createTablesForAgency(req.body.postal_code);
		const textResultCreatingTablesForAgency = resultCreatingTablesForAgency.message;

		const resultLocatingAgencyInArea = await agenciesService.locateAgencyInArea(0, req.body.province, req.body.district, req.body.managed_wards, agencyId, req.body.postal_code);

		const textResultLocatingAgencyInArea = resultLocatingAgencyInArea.message;

		return res.status(200).json({
			error: false,
			message: `
			Kết quả:\n
			${textResultCreatingNewStaff}\n
			${textResultCreatingNewAgency}\n
			${textResultCreatingTablesForAgency}\n
			${textResultLocatingAgencyInArea}`,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const updateAgency = async (req, res) => {
	try {
		const { error } = agencyValidation.validateFindingAgencyByAgency(req.query) || agencyValidation.validateUpdatingAgency(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (agencyCannotBeAffected.includes(req.query.agency_id)) {
			return res.status(400).json({
				error: true,
				message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
			});
		}
		
		const result = await agenciesService.updateAgency(req.body, req.query);
		
		if (result.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Bưu cục có mã bưu cục ${req.query.agency_id} không tồn tại.`,
			});
		}

		return res.status(200).json({
			error: false,
			message: `Cập nhật thông tin bưu cục có mã bưu cục ${req.query.agency_id} thành công.`,
		});

	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const deleteAgency = async (req, res) => {
	try {
		const { error } = agencyValidation.validateDeletingAgency(req.query);
		
		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (agencyCannotBeAffected.includes(req.query.agency_id)) {
			return res.status(400).json({
				error: true,
				message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
			});
		}

		const resultFindingOneAgency = await agenciesService.getOneAgency(req.query);
		if (!resultFindingOneAgency || resultFindingOneAgency.length <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bưu cục/đại lý không tồn tại.",
			});
		}

		const agency = resultFindingOneAgency[0];
		const agencyId = agency.agency_id;
		const province = agency.province;
		const district = agency.district;
		const wards = agency.managed_wards ? JSON.parse(agency.managed_wards) : new Array();

		const resultDeletingAgency = await agenciesService.deleteAgency(req.query);

		let textResultDeletingAgency;
		if (!resultDeletingAgency || resultDeletingAgency.affectedRows <= 0) {
			textResultDeletingAgency = `Xóa bưu cục có mã bưu cục ${req.query.agency_id} thất bại.`;
		}
		else {
			textResultDeletingAgency = `Xóa bưu cục có mã bưu cục ${req.query.agency_id} thành công.`;
		}

		const agencyIdSubParts = agencyId.split('_');
		const postalCode = agencyIdSubParts[1];

		const resultDroppingTableForAgency = await agenciesService.dropTableForAgency(postalCode);
		const textResultDroppingTablesForAgency = resultDroppingTableForAgency.message;
		
		const resultLocatingAgencyInArea = await agenciesService.locateAgencyInArea(1, province, district, wards, agencyId, postalCode);
		const textResultLocatingAgencyInArea = resultLocatingAgencyInArea.message;

		return res.status(201).json({
			error: false,
			message: `
			Kết quả:\n
			${textResultDeletingAgency}
			${textResultDroppingTablesForAgency}
			${textResultLocatingAgencyInArea}`,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const updateAgencyCompany = async (req, res) => {
	try {
		const { error } = agencyValidation.validateFindingAgencyByAgency(req.query) || agencyValidation.validateUpdateAgencyCompany(req.body);
	
		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
	
		if (agencyCannotBeAffected.includes(req.query.agency_id)) {
			return res.status(400).json({
				error: true,
				message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
			});
		}
	
		const result = await agencyCompanyService.updateAgencyCompany(req.body, req.query);
	
		if (result.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Bưu cục doanh nghiệp có mã bưu cục ${req.query.agency_id} không tồn tại.`,
			});
	  	}
  
		return res.status(200).json({
			error: false,
			message: `Cập nhật thông tin bưu cục doanh nghiệp có mã bưu cục ${req.query.agency_id} thành công.`,
		});

	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updateLicenseAgencyCompany = async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: true,
                message: "Ảnh không được để trống.",
            });
        }
		
		const { error } = agencyValidation.validateQueryUpdatingLicenseImages(req.query)  
		if (error) {
			return res.status(400).json({
			error: true,
			message: error.message,
			});
		}
	  
		if (agencyCannotBeAffected.includes(req.query.agency_id)) {
			return res.status(400).json({
			error: true,
			message: `Bưu cục có mã ${req.query.agency_id} không thể bị tác động.`,
			});
		}
		
		let licensesImgs = new Array();	
		if (req.files)
		{	
			req.files.forEach((file) => {
				licensesImgs.push(file.filename);
				console.log(file);
			});
		}
		
		const newInfo = {
			license: JSON.stringify(licensesImgs),
		};

		const result = await agencyCompanyService.updateAgencyCompany(newInfo, req.query);
		
		const folderPath = path.join("storage", "agency_company", "license", `${req.query.agency_id}`)
		if (fs.existsSync(folderPath))
		{
			fs.rmdirSync(folderPath, { recursive: true });
		}

		const tempLicenseFolder = path.join("storage", "agency_company", "license_temp");
		if (!fs.existsSync(tempLicenseFolder)) {
			fs.mkdirSync(tempLicenseFolder, { recursive: true });
		}	
  
		const officialFolderLicense = path.join("storage", "agency_company", "license", `${req.query.agency_id}`);
		if (!fs.existsSync(officialFolderLicense)) {
			fs.mkdirSync(officialFolderLicense, { recursive: true });
		}
			  
		req.files.forEach(file => {
			const tempFileLicensePath = path.join(tempLicenseFolder, file.filename);
			if (fs.existsSync(tempFileLicensePath)) {
				const officialLicensePath = path.join(officialFolderLicense, file.filename);
				fs.renameSync(tempFileLicensePath, officialLicensePath);
			}
		});
    
		if (result.affectedRows <= 0) {
			return res.status(404).json({
			error: true,
			message: `Bưu cục doanh nghiệp có mã bưu cục ${req.query.agency_id} không tồn tại.`,
			});
		}
  
		return res.status(200).json({
			error: false,
			message: `Cập nhật giấy phép kinh doanh bưu cục doanh nghiệp có mã bưu cục ${req.query.agency_id} thành công.`,
		});
	}
  	catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const getLicenseAgencyCompany = async (req, res) => {
    try {
        const { error } = agencyValidation.validateQueryUpdatingLicenseImages(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultGettingOneAgencyCompany = await agencyCompanyService.getOneAgencyCompany({ agency_id: req.query.agency_id });
        if (!resultGettingOneAgencyCompany || resultGettingOneAgencyCompany.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Bưu cục doanh nghiệp có mã ${req.query.agency_id} không tồn tại.`,
            });
        }
        let licenseImgs;
        try 
		{
            licenseImgs = resultGettingOneAgencyCompany[0].license ? JSON.parse(resultGettingOneAgencyCompany[0].license) : new Array();
		}
		catch (error) 
		{
            licenseImgs = new Array();
        }

        const folderPath =path.join(__dirname, ".." ,"storage", "agency_company", "license", `${req.query.agency_id}`);
        licenseImgs = licenseImgs.map(image => folderPath + "\\" + image);
        const archive = archiver("zip");
        archive.on('error', function(err) {
            res.status(500).send({error: err.message});
        });
    
        res.attachment('license.zip');
    
		archive.pipe(res);

        licenseImgs.forEach(image => {
            archive.file(image, { name: image });
        });       
    
        archive.finalize();
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const getManagedWards = async (req, res) => {
	try {
		const { error } = agencyValidation.validateCheckingExistAgency(req.query);
		if (error) {
			return res.status(404).json({
				error: true,
				message: error.message,
			});
		}

		const resultGettingManagedWards = await agenciesService.getAgencyManagedWards(req.query.agency_id);
		return res.status(200).json({
			error: false,
			data: resultGettingManagedWards[0].managed_wards,
			message: "Lấy thông tin các phường/xã/thị trấn được đảm nhận thành công.",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

module.exports = {
	checkExistAgency,
	getAgencies,
	createNewAgency,
	updateAgency,
	deleteAgency,
	updateLicenseAgencyCompany,
	updateAgencyCompany,
	getLicenseAgencyCompany,
	getManagedWards,
};
