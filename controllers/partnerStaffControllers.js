const partnerStaffsService = require ("../services/partnerStaffsService");
const utils = require("../utils");
const controllerUtils = require("./utils");
const fs = require("fs");
const path = require('path');

const partnerStaffValidation = new controllerUtils.PartnerStaffValidation();

const verifyStaffSuccess = (req, res) => {
	return res.status(200).json({
		error: false,
		valid: true,
		message: "Xác thực thành công."
	});
};

const verifyStaffFail = (req, res) => {
	return res.status(404).json({
		error: true,
		valid: false,
		message: "Xác thực thất bại. Vui lòng đăng nhập hoặc đăng ký.",
	});
};

const checkExistPartnerStaff = async (req, res) => {
	const { error } = partnerStaffValidation.validateCheckingExistPartnerStaff(req.query);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
		const existed = await partnerStaffsService.checkExistPartnerStaff(Object.keys(req.query), Object.values(req.query));
		return res.status(200).json({
			error: false,
			existed: existed,
			message: existed ? "Nhân viên đã tồn tại." : "Nhân viên chưa tồn tại.",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const getPartnerStaffs = async (req, res) => {
	if (req.user.permission == 2) {
		try {
			const { error } = partnerStaffValidation.validateFindingPartnerStaffByPartnerStaff(req.query);

			if (error) {
				return res.status(400).json({
					error: true,
					message: "Mã nhân viên không hợp lệ.",
				});
			}

			if (req.user.staff_id !== req.query.staff_id) {
				return res.status(401).json({
					error: true,
					message: "Bạn không được phép truy cập tài nguyên này.",
				});
			}

			const keys = Object.keys(req.query);
			const values = Object.values(req.query);

			const result = await partnerStaffsService.getOnePartnerStaff(keys, values); 
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
		const { error } = partnerStaffValidation.validateFindingPartnerStaffByAdmin(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		keys.push("agency_id");
		values.push(req.user.agency_id);

		try {
			const result = await partnerStaffsService.getManyPartnerStaffs(keys, values);
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
};

const createNewPartnerStaff = async (req, res) => {
	try {

		const { error } = partnerStaffValidation.validateCreatingPartnerStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const existed = await partnerStaffsService.checkExistPartnerStaff(["cccd", "phone_number", "email"], [req.body.cccd, req.body.phone_number, req.body.email]);

		if (existed) {
			return res.status(409).json({
				error: true,
				message: "Nhân viên đã tồn tại.",
			});
		}

		req.body.password = utils.hash(req.body.password);

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		if (req.files.avatar ) {
			keys.push("avatar");
			values.push(req.files.avatar[0].filename);
		}

		if (req.files.license_before && req.files.license_after) {
			keys.push("image_license");
			values.push(JSON.stringify(new Object({
				before: req.files.license_before[0].filename,
				after: req.files.license_after[0].filename
			})));
		}

		await partnerStaffsService.createNewPartnerStaff(keys, values);

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

const updatePartnerStaffInfo = async (req, res) => {
	const { error } = partnerStaffValidation.validateFindingPartnerStaffByPartnerStaff(req.query) || partnerStaffValidation.validateUpdatingPartnerStaff(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	const staffId = req.query.staff_id;

	req.body.active = true;

	const keys = Object.keys(req.body);
	const values = Object.values(req.body);

	// Kiểm tra nhân viên được cập nhật có thuộc agency của admin 
	const conditionFields = ["staff_id"];
	const conditionValues = [staffId];

	try {
		const result = await partnerStaffsService.updatePartnerStaff(keys, values, conditionFields, conditionValues);

		if (result[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Nhân viên không tồn tại."
			});
		}

		res.status(200).json({
			error: false,
			message: "Cập nhật thành công.",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error,
		});
	}
};

const deletePartnerStaff = async (req,res)=>{
	if (!req.isAuthenticated() || req.user.permission < 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không có quyền truy cập tài nguyên này!",
		});
	}

	const { error } = partnerStaffValidation.validateDeletingPartnerStaff(req.query);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
	// kiểm tra staffId có thuộc quyền quản lý của agencyId của admin hay không
	const partnerStaff = await partnerStaffsService.getOnePartnerStaff(["staff_id"], [req.query.staff_id]);
	
	if (!partner || partnerStaff.length <= 0) {
		return res.status(200).json({
			error: true,
			message: "Bạn không có quyền truy cập tài nguyên này. ",
		});
	}
	
	const result = await partnerStaffsService.deletePartnerStaff(["staff_id"], [req.query.staff_id]);
	
	if (!result || result.affectedRows <= 0) {
		return res.status(404).json({
			error: true,
			message: "Người dùng không tồn tại.",
		});
	}

	const avatar = partnerStaff[0]["avatar"];

	if (avatar) {
		const avatarPath = path.join("storage", "partner_staff", "img", "avatar", partnerStaff[0]["avatar"]);
		if (fs.existsSync(avatarPath)) {
			fs.unlinkSync(avatarPath,(err) => {
				if (err) {
					console.log(err);
				} else {
					console.log(`Avatar ${req.query.staff_id} deleted successfully`);
				}
			});
		}
	}

	const license = partnerStaff[0]["image_license"];

	if (license) {
		const licenseFront = license["before"];
		const licenseBack = license["after"];
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
		message: `Xóa nhân viên ${req.query.staff_id} thành công.`,
	});

	} catch (error) {
		res.status(500).json({
			status: "error",
			message: "Đã xảy ra lỗi. Vui lòng thử lại.",
		});
	}
};

const updatePartnerPassword = async (req, res) => {
	const { error } = partnerStaffValidation.validateUpdatePartnerPassword(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}
	
	const hashedNewPassword = utils.hash(req.body.new_password);

	try {
		const result = await partnerStaffsService.updatePartnerPassword(["password", "active"], [hashedNewPassword, 1], ["staff_id"], [req.user.staff_id]) ;

		if (!result || result[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Nhân viên không tồn tại.",
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
	if (!req.file) {
		return res.status(404).json({
			error: true,
			message: "Vui lòng thêm hình ảnh cá nhân.",
		});
	}

	try {
		const partnerStaff = await partnerStaffsService.getOnePartnerStaff(["staff_id"], [req.query.staff_id]);

		if (!partnerStaff || partnerStaff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bạn không được phép truy cập tài nguyên này.",
			});
		}

		const result = await partnerStaffsService.updatePartnerStaff(["avatar"], [req.file.filename], ["staff_id"], [req.query.staff_id]);

		if (!result || result[0].affectedRows <= 0) {
			return res.status(403).json({
				error: true,
				message: "Bạn không có quyền truy cập tài nguyên này.",
			});
		}

		if (partnerStaff[0]["avatar"]) {
			const oldAvatarPath = path.join("storage", "partner_staff", "img", "avatar", partnerStaff[0]["avatar"]);
			fs.unlinkSync(oldAvatarPath);
		}

		const tempFolderAvatarPath = path.join("storage", "partner_staff", "img", "avatar_temp");
		if (!fs.existsSync(tempFolderAvatarPath)) {
			fs.mkdirSync(tempFolderAvatarPath, { recursive: true });
		}	

		const officialFolderAvatarPath = path.join("storage", "partner_staff", "img", "avatar");
		if (!fs.existsSync(officialFolderAvatarPath)) {
			fs.mkdirSync(officialFolderAvatarPath, { recursive: true });
		}

		const tempAvatarFilePath = path.join(tempFolderAvatarPath, req.file.filename);
		const officialAvatarFilePath = path.join(officialFolderAvatarPath, req.file.filename);

		fs.renameSync(tempAvatarFilePath, officialAvatarFilePath);

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

const logout = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission < 1) {
		return res.status(401).json({
		error: true,
		message: "Vui lòng đăng nhập.",
		});
	}
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

const updatePartnerLicenseImg = async (req, res) => {
	if (!req.files.license_before)
	{
		return res.status(404).json({
			error: true,
			message: "Vui lòng thêm hình ảnh mặt trước.",
		});
	}

	if (!req.files.license_after)
	{
		return res.status(404).json({
			error: true,
			message: "Vui lòng thêm hình ảnh mặt sau.",
		});
	}


	try {
		const partnerStaff = await partnerStaffsService.getOnePartnerStaff(["staff_id"], [req.query.staff_id]);
		console.log(partnerStaff);
		if (!partnerStaff || partnerStaff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bạn không được phép truy cập tài nguyên này.",
			});
		}

		const imgs = JSON.stringify({ 
			beforeImg : req.files.license_before[0].filename,
			afterImg :	req.files.license_after[0].filename
		});

		const result = await partnerStaffsService.updatePartnerStaff(["image_license"], [imgs], ["staff_id"], [req.query.staff_id]);

		if (!result || result[0].affectedRows <= 0) {
			return res.status(403).json({
				error: true,
				message: "Bạn không có quyền truy cập tài nguyên này.",
			});
		}

		const imageLicense = JSON.parse(partnerStaff[0].image_license);
		const licenseBefore = imageLicense.before;
		const licenseAfter = imageLicense.after;

		const licensePath = path.join("storage", "partner_staff", "img", "license");
		const oldLicenseFrontPath = path.join(licensePath, licenseBefore);
		const oldLicenseBackPath = path.join(licensePath, licenseAfter);

		fs.unlinkSync(oldLicenseFrontPath);
		fs.unlinkSync(oldLicenseBackPath);

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
	checkExistPartnerStaff,
	createNewPartnerStaff,
	getPartnerStaffs,
	updatePartnerStaffInfo,
	deletePartnerStaff,
	verifyStaffSuccess,
	verifyStaffFail,
	updatePartnerPassword,
	updatePartnerAvatar,
	updatePartnerLicenseImg,
	logout,
};