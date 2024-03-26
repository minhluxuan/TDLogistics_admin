const partnerStaffsService = require ("../services/partnerStaffsService");
const transportPartnersService = require("../services/transportPartnerService");
const utils = require("../utils");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require("path");

const partnerStaffValidation = new validation.PartnerStaffValidation();

const checkExistPartnerStaff = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateCheckingExistPartnerStaff(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const resultCheckingExistPartnerStaff = await partnerStaffsService.checkExistPartnerStaff(req.query);
		
		return res.status(200).json({
			error: false,
			existed: resultCheckingExistPartnerStaff.existed,
			message: resultCheckingExistPartnerStaff.message,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const getPartnerStaffs = async (req, res) => {
	const paginationConditions = { rows: 0, page: 0 };

	if (req.query.rows) {
		paginationConditions.rows = parseInt(req.query.rows);
	}

	if (req.query.page) {
		paginationConditions.page = parseInt(req.query.page);
	}

	const { error: paginationError } = partnerStaffValidation.validatePaginationConditions(paginationConditions);
	if (paginationError) {
		return res.status(400).json({
			error: true,
			message: paginationError.message,
		});
	}

	if (["PARTNER_DRIVER", "PARTNER_SHIPPER"].includes(req.user.role)) {
		const { error } = partnerStaffValidation.validateFindingPartnerStaffByPartnerStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (req.user.staff_id !== req.body.staff_id) {
			return res.status(403).json({
				error: true,
				message: "Người dùng không được phép truy cập tài nguyên này.",
			});
		}

		const result = await partnerStaffsService.getOnePartnerStaff(req.body); 
		return res.status(200).json({
			error: false,
			data: result,
			message: "Lấy thông tin thành công.",
		});
	}

	if (["TRANSPORT_PARTNER_REPRESENTOR"].includes(req.user.role)) { 
		const { error } = partnerStaffValidation.validateFindingPartnerStaffByPartner(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		req.body.partner_id = req.user.partner_id;

		const result = await partnerStaffsService.getManyPartnerStaffs(req.body, paginationConditions);
		return res.status(200).json({
			error: false,
			data: result,
			message: "Lấy thông tin thành công.",
		});
	}

	if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
		const { error } = partnerStaffValidation.validateFindingPartnerStaffByAdmin(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		req.body.agency_id = req.user.agency_id;

		const result = await partnerStaffsService.getManyPartnerStaffs(req.body, paginationConditions);
		return res.status(200).json({
			error: false,
			data: result,
			message: "Lấy thông tin thành công.",
		});
	}

	if (["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
		const { error } = partnerStaffValidation.validateFindingPartnerStaffByAdmin(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const result = await partnerStaffsService.getManyPartnerStaffs(req.body, paginationConditions);
		return res.status(200).json({
			error: false,
			data: result,
			message: "Lấy thông tin thành công.",
		});
	}
};

const createNewPartnerStaff = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateCreatingPartnerStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const staffIdSubParts = req.user.staff_id.split('_');
		const partnerIdSubParts = req.body.partner_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
		&& (staffIdSubParts[0] !== partnerIdSubParts[0]
		|| staffIdSubParts[1] !== partnerIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Đối tác có mã đối tác ${req.body.partner_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		const resultGettingOnePartner = await transportPartnersService.getOnePartner({ transport_partner_id: req.body.partner_id });

		if (!resultGettingOnePartner || resultGettingOnePartner.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Đối tác có mã đối tác ${req.body.partner_id} không tồn tại.`,
			});
		}

		const partner = resultGettingOnePartner[0];

		const tempUser = new Object({
			username: req.body.username,
			cccd: req.body.cccd,
			email: req.body.email || null,
			phone_number: req.body.phone_number || null,
		});

		for (const key in tempUser) {
			if (tempUser[key] === null) {
				delete tempUser[key];
			}
		}

		const checkingExistPartnerStaff = await partnerStaffsService.checkExistPartnerStaff(tempUser);

		if (checkingExistPartnerStaff.existed) {
			return res.status(409).json({
				error: true,
				message: checkingExistPartnerStaff.message,
			});
		}

		req.body.agency_id = partner.agency_id;
		req.body.staff_id = staffIdSubParts[0] + '_' + staffIdSubParts[1] + '_' + req.body.cccd;
		req.body.password = utils.hash(req.body.password);
		
		if (req.files) {
			if (req.files.avatar) {
				req.body.avatar = req.files.avatar[0].filename;
			}
	
			if (req.files.license_before && req.files.license_after) {
				req.body.avatar.image_license = JSON.stringify(new Object({
					before: req.files.license_before[0].filename,
					after: req.files.license_after[0].filename
				}));
			}
		}

		const resultCreatingNewPartnerStaff = await partnerStaffsService.createNewPartnerStaff(req.body);

		if (!resultCreatingNewPartnerStaff || resultCreatingNewPartnerStaff.affectedRows <= 0) {
			return res.status(409).json({
				error: true,
				message: `Tạo tài khoản nhân viên đối tác vận tải có mã nhân viên ${req.body.staff_id} thất bại.\n`
			});
		}

		if (req.files) {
			if (req.files.avatar) {
				const tempFolderAvatarPath = path.join("storage", "partner_staff", "img", "avatar_temp");
				if (!fs.existsSync(tempFolderAvatarPath)) {
					fs.mkdirSync(tempFolderAvatarPath, { recursive: true });
				}	
	
				const officialFolderAvatarPath = path.join("storage", "partner_staff", "img", "avatar");
				if (!fs.existsSync(officialFolderAvatarPath)) {
					fs.mkdirSync(officialFolderAvatarPath, { recursive: true });
				}
	
				const tempAvatarFilePath = path.join(tempFolderAvatarPath, req.files.avatar[0].filename);
				const officialAvatarFilePath = path.join(officialFolderAvatarPath, req.files.avatar[0].filename);
				
				fs.renameSync(tempAvatarFilePath, officialAvatarFilePath);
			}
	
			if (req.files.license_before && req.files.license_after) {
				const tempFolderLicensePath = path.join("storage", "partner_staff", "img", "license_temp");
				if (!fs.existsSync(tempFolderLicensePath)) {
					fs.mkdirSync(tempFolderLicensePath, { recursive: true });
				}	
	
				const officialFolderLicensePath = path.join("storage", "partner_staff", "img", "license");
				if (!fs.existsSync(officialFolderLicensePath)) {
					fs.mkdirSync(officialFolderLicensePath, { recursive: true });
				}	
	
				const tempBeforeLicenseFilePath = path.join(tempFolderLicensePath, req.files.license_before[0].filename);
				const officialBeforeLicenseFilePath = path.join(officialFolderLicensePath, req.files.license_before[0].filename);
				
				const tempAfterLicenseFilePath = path.join(tempFolderLicensePath, req.files.license_after[0].filename);
				const officialAfterLicenseFilePath = path.join(officialFolderLicensePath, req.files.license_after[0].filename);
	
				fs.renameSync(tempBeforeLicenseFilePath, officialBeforeLicenseFilePath);
				fs.renameSync(tempAfterLicenseFilePath, officialAfterLicenseFilePath);
			}
		}

		return res.status(201).json({
			error: false,
			message: `Tạo tài khoản nhân viên đối tác vận tải có mã nhân viên ${req.body.staff_id} thành công.\n`,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updatePartnerStaffInfo = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateFindingPartnerStaffByPartnerStaff(req.query) || partnerStaffValidation.validateUpdatingPartnerStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
		
		const updatorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
		&& (staffIdSubParts[0] !== updatorIdSubParts[0]
		|| staffIdSubParts[1] !== updatorIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.body.partner_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		const propertiesWillBeCheckExist = ["username", "email", "phone_number", "bin"];
		const tempUser = new Object();

		for (const prop of propertiesWillBeCheckExist) {
			if (req.body.hasOwnProperty(prop) && req.body[prop]) {
				tempUser[prop] = req.body[prop];
			}
		}

		if (Object.keys(tempUser).length > 0) {
			const resultCheckingExistPartnerStaff = await partnerStaffsService.checkExistPartnerStaff(tempUser);
			
			if (resultCheckingExistPartnerStaff.existed) {
				return res.status(409).json({
					error: true,
					message: resultCheckingExistPartnerStaff.message,
				});
			}
		}

		const resultUpdatingPartnerStaff = await partnerStaffsService.updatePartnerStaff(req.body, { staff_id: req.query.staff_id });
		if (!resultUpdatingPartnerStaff || resultUpdatingPartnerStaff.affectedRows <= 0) {
			return res.status(200).json({
				error: false,
				message: `Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng thất bại.`,
			});
		}

		return res.status(200).json({
			error: false,
			message: `Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng thành công.`,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error,
		});
	}
};

const deletePartnerStaff = async (req,res)=>{	
	try {
		const { error } = partnerStaffValidation.validateDeletingPartnerStaff(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
	
		const deletorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
		&& (staffIdSubParts[0] !== deletorIdSubParts[0]
		|| staffIdSubParts[1] !== deletorIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.body.partner_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		const resultGettingOnePartner = await partnerStaffsService.getOnePartnerStaff(req.query);

		if (!resultGettingOnePartner || resultGettingOnePartner.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
			});
		}

		const staff = resultGettingOnePartner[0];
		const avatar = staff.avatar;
		const license = staff.license ? JSON.parse(staff.license) : null;

		const resultDeletingPartnerStaff = await partnerStaffsService.deletePartnerStaff(req.query);
		if (!resultDeletingPartnerStaff || resultDeletingPartnerStaff.affectedRows <= 0) {
			return res.status(200).json({
				error: false,
				message: `Xóa nhân viên có mã nhân viên ${req.query.staff_id} thất bại.`,
			});
		}


		if (avatar) {
			const avatarPath = path.join("storage", "partner_staff", "img", "avatar", avatar);
			if (fs.existsSync(avatarPath)) {
				fs.unlinkSync(avatarPath);
			}
		}

		if (license) {
			const licenseFront = license.before;
			const licenseBack = license.after;

			const licensePath = path.join("storage", "partner_staff", "img", "license");

			if (licenseFront) {
				const licenseFrontPath = path.join(licensePath, licenseFront);
				if (fs.existsSync(licenseFrontPath)) {
					fs.unlinkSync(licenseFrontPath);
				}
			}

			if (licenseBack) {
				const licenseBackPath = path.join(licensePath, licenseBack);
				if (fs.existsSync(licenseBackPath)) {
					fs.unlinkSync(licenseBackPath);
				}
			}
		}
	
		return res.status(200).json({
			error: false,
			message: `Xóa nhân viên có mã nhân viên ${req.query.staff_id} thành công.`,
		});

	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updatePartnerPassword = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateUpdatePartnerPassword(req.body);

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

		const condition = new Object({
			staff_id: req.user.staff_id,
		});

		const resultUpdatingPassword = await partnerStaffsService.updatePartnerPassword(updatedInfo, condition);

		if (!resultUpdatingPassword || resultUpdatingPassword.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Cập nhật mật khẩu không thành công. Người dùng không tồn tại.",
			});
		}

		return res.status(200).json({
			error: false,
			message: "Cập nhật mật khẩu thành công.",
		});

	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updatePartnerAvatar = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateFindingPartnerStaffByPartnerStaff(req.query);
		
		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const updatorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
		&& (staffIdSubParts[0] !== updatorIdSubParts[0]
		|| staffIdSubParts[1] !== updatorIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff({ staff_id: req.query.staff_id });

		if (!resultGettingOnePartnerStaff || resultGettingOnePartnerStaff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
			});
		}

		const partner = resultGettingOnePartnerStaff[0];
		const fileName = partner.avatar;

		const resultUpdatingStaff = await partnerStaffsService.updatePartnerStaff({ avatar: req.file.filename }, { staff_id: req.query.staff_id });
		if (!resultUpdatingStaff || resultUpdatingStaff.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.user.staff_id} không tồn tại.`
			});
		}

		const tempFolderPath = path.join("storage", "partner_staff", "img", "avatar_temp");
		if (!fs.existsSync(tempFolderPath)) {
			fs.mkdirSync(tempFolderPath, { recursive: true });
		}	

		const officialFolderPath = path.join("storage", "partner_staff", "img", "avatar");
		if (!fs.existsSync(officialFolderPath)) {
			fs.mkdirSync(officialFolderPath, { recursive: true });
		}

		if (fileName) {
			const oldFilePath = path.join(officialFolderPath, fileName);
			if (fs.existsSync(oldFilePath)) {
				fs.unlinkSync(oldFilePath);
			}
		}

		const tempFilePath = path.join(tempFolderPath, req.file.filename);
		const officialFilePath = path.join(officialFolderPath, req.file.filename);

		fs.renameSync(tempFilePath, officialFilePath);

		return res.status(201).json({
			error: false,
			message: `Kết quả:\n
			Cập nhật avatar cho nhân viên có mã nhân viên ${req.query.staff_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updatePartnerLicenseImg = async (req, res) => {
	try {
		const updatorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
		&& (staffIdSubParts[0] !== updatorIdSubParts[0]
		|| staffIdSubParts[1] !== updatorIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.body.partner_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

		const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff({ staff_id: req.query.staff_id });

		if (!resultGettingOnePartnerStaff || resultGettingOnePartnerStaff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.user.staff_id} không tồn tại.`,
			});
		}

		const staff = resultGettingOnePartnerStaff[0];

		const imgs = JSON.stringify({
			before: req.files.license_before[0].filename,
			after: req.files.license_after[0].filename
		});

		const imageLicense = staff.image_license ? JSON.parse(staff.image_license) : null;

		const resultUpdatingLicenses = await partnerStaffsService.updatePartnerStaff({ image_license: imgs}, { staff_id: req.query.staff_id });
		if (!resultUpdatingLicenses || resultUpdatingLicenses.affectedRows <= 0) {
			return res.status(403).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.user.staff_id} không tồn tại.`,
			});
		}

		const tempFolderLicensePath = path.join("storage", "partner_staff", "img", "license_temp");
		if (!fs.existsSync(tempFolderLicensePath)) {
			fs.mkdirSync(tempFolderLicensePath, { recursive: true });
		}

		const officialFolderLicensePath = path.join("storage", "partner_staff", "img", "license");
		if (!fs.existsSync(officialFolderLicensePath)) {
			fs.mkdirSync(officialFolderLicensePath, { recursive: true });
		}

		if (imageLicense) {
			if (imageLicense.before) {
				const oldLicenseFrontPath = path.join(licensePath, licenseBefore);
				if (fs.existsSync(oldLicenseFrontPath)) {
					fs.unlinkSync(oldLicenseFrontPath);
	
				}
			}
			if (imageLicense.after) {
				const oldLicenseBackPath = path.join(licensePath, licenseAfter);
				if (fs.existsSync(oldLicenseBackPath)) {
					fs.unlinkSync(oldLicenseBackPath);
				}
			}
		}

		const tempBeforeLicenseFilePath = path.join(tempFolderLicensePath, req.files.license_before[0].filename);
		const officialBeforeLicenseFilePath = path.join(officialFolderLicensePath, req.files.license_before[0].filename);
		
		fs.renameSync(tempBeforeLicenseFilePath, officialBeforeLicenseFilePath);

		const tempAfterLicenseFilePath = path.join(tempFolderLicensePath, req.files.license_after[0].filename);
		const officialAfterLicenseFilePath = path.join(officialFolderLicensePath, req.files.license_after[0].filename);
		
		fs.renameSync(tempAfterLicenseFilePath, officialAfterLicenseFilePath);

		return res.status(201).json({
			error: false,
			message: `Cập nhật hình ảnh giấy phép lái xe cho nhân viên ${req.query.staff_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const logout = async (req, res) => {
	try {
		res.clearCookie("connect.sid");
		req.logout(() => {
			req.session.destroy();
		});

		res.status(200).json({
			error: false,
			message: "Đăng xuất thành công.",
		});
	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Đã xảy ra lỗi. Vui lòng thử lại.",
		});
	}
};

const getPartnerAvatar = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateGetPartnerAvatarAndLicense(req.query);
	
		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (["PARTNER_DRIVER", "PARTNER_SHIPPER"].includes(req.user.role)) {
			if (req.user.staff_id !== req.body.staff_id) {
				return res.status(403).json({
					error: true,
					message: "Người dùng không được phép truy cập tài nguyên này.",
				});
			}
	
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const fileName = partner.avatar ? partner.avatar : null;
				
			if (fileName) {
				const file = path.join(__dirname,"..","storage", "partner_staff", "img", "avatar", fileName);
				if (fs.existsSync(file)) {
						return res.status(200).sendFile(file);
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});			
		}

		if (["TRANSPORT_PARTNER_REPRESENTOR"].includes(req.user.role)) { 
			req.body.partner_id = req.user.partner_id;
	
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const fileName = partner.avatar ? partner.avatar : null;
	
			if (fileName) {
				const file = path.join(__dirname,"..", "storage", "partner_staff", "img", "avatar", fileName);
				if (fs.existsSync(file)) {
						return res.status(200).sendFile(file);
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});
		}
	
		if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			req.body.agency_id = req.user.agency_id;
	
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const fileName = partner.avatar ? partner.avatar : null;
	
			if (fileName) {
				const file = path.join(__dirname,"..", "storage", "partner_staff", "img", "avatar", fileName);
				if (fs.existsSync(file)) {
						return res.status(200).sendFile(file);
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});			
		}
	
		if (["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const fileName = partner.avatar ? partner.avatar : null;
			
			if (fileName) {
				const file = path.join(__dirname,"..", "storage", "partner_staff", "img", "avatar", fileName);
				if (fs.existsSync(file)) {
						return res.status(200).sendFile(file);
				}	
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});		
		}
	} 
	catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const getPartnerLicenseBefore = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateGetPartnerAvatarAndLicense(req.query);
	
		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (["PARTNER_DRIVER", "PARTNER_SHIPPER"].includes(req.user.role)) {
			if (req.user.staff_id !== req.body.staff_id) {
				return res.status(403).json({
					error: true,
					message: "Người dùng không được phép truy cập tài nguyên này.",
				});
			}

			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
	
			if (imageLicense) {
				if (imageLicense.before)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.before);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});			
		}

		if (["TRANSPORT_PARTNER_REPRESENTOR"].includes(req.user.role)) { 
			req.body.partner_id = req.user.partner_id;
	
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
	
			if (imageLicense) {
				if (imageLicense.before)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.before);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});			
		}
	
		if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			req.body.agency_id = req.user.agency_id;
	
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
	
			if (imageLicense) {
				if (imageLicense.before)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.before);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});		
		}
	
		if (["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
			
			if (imageLicense) {
				if (imageLicense.before)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.before);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}
			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});		
		}
	} 
	catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const getPartnerLicenseAfter = async (req, res) => {
	try {
		const { error } = partnerStaffValidation.validateGetPartnerAvatarAndLicense(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (["PARTNER_DRIVER", "PARTNER_SHIPPER"].includes(req.user.role)) {
			if (req.user.staff_id !== req.body.staff_id) {
				return res.status(403).json({
					error: true,
					message: "Người dùng không được phép truy cập tài nguyên này.",
				});
			}

			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
	
			if (imageLicense) {
				if (imageLicense.after)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.after);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});		
		}

		if (["TRANSPORT_PARTNER_REPRESENTOR"].includes(req.user.role)) { 
			req.body.partner_id = req.user.partner_id;
	
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
	
			if (imageLicense) {
				if (imageLicense.after)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.after);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});		
		}
	
		if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			req.body.agency_id = req.user.agency_id;
	
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
	
			if (imageLicense) {
				if (imageLicense.after)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.after);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});		
		}
	
		if (["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const resultGettingOnePartnerStaff = await partnerStaffsService.getOnePartnerStaff(req.body); 
			const partner = resultGettingOnePartnerStaff[0];
			const imageLicense = partner.image_license ? JSON.parse(partner.image_license) : null;
	
			if (imageLicense) {
				if (imageLicense.after)
				{
					const fileName = path.join(__dirname,"..","storage", "partner_staff", "img", "license", imageLicense.after);
					if (fs.existsSync(fileName)) {
						return res.status(200).sendFile(fileName);
					}
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});		
		}
	} 
	catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

module.exports = {
	checkExistPartnerStaff,
	createNewPartnerStaff,
	getPartnerStaffs,
	updatePartnerStaffInfo,
	deletePartnerStaff,
	updatePartnerPassword,
	updatePartnerAvatar,
	updatePartnerLicenseImg,
	logout,
	getPartnerAvatar,
	getPartnerLicenseBefore,
	getPartnerLicenseAfter,
};