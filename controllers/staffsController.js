const staffsService = require ("../services/staffsService");
const utils = require("../utils");
const controllerUtils = require("./utils");
const fs = require("fs");
const path = require('path');

const staffValidation = new controllerUtils.StaffValidation();

const verifyStaffSuccess = (req, res) => {
	return res.status(200).json({
		error: false,
		valid: true,
		message: "Xác thực thành công."
	});
}

const verifyStaffFail = (req, res) => {
	return res.status(404).json({
		error: true,
		valid: false,
		message: "Xác thực thất bại. Vui lòng đăng nhập hoặc đăng ký.",
	});
}

const checkExistStaff = async (req, res) => {
	const { error } = staffValidation.validateCheckingExistStaff(req.query);

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
			message: existed ? "Nhân viên đã tồn tại." : "Nhân viên chưa tồn tại.",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getStaffs = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission < 2) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	if (req.user.permission == 2) {
		try {
			const { error } = staffValidation.validateFindingStaffByStaff(req.query);

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

			const result = await staffsService.getOneStaff(keys, values); 
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
		const { error } = staffValidation.validateFindingStaffByAdmin(req.body);

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
			const result = await staffsService.getManyStaffs(keys, values);
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

const createNewStaff = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission < 2) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	try {
		const userRequestValidation = new controllerUtils.StaffValidation();

		const { error } = userRequestValidation.validateCreatingStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const result = await staffsService.checkExistStaff(["cccd"] , [req.body.cccd]);

		if (result) {
			return res.status(400).json({
				error: true,
				message: "Nhân viên đã tồn tại.",
			});
		}

		req.body.password = utils.hash(req.body.password);

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		if (req.file) {
			keys.push("avatar");
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

const updateStaffInfo = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission !== 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	const { error } = staffValidation.validateFindingStaffByStaff(req.query) || staffValidation.validateUpdatingStaff(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	const staffId = req.query.staff_id;
	const agencyId = req.user.agency_id;

	if (req.body.hasOwnProperty("paid_salary")) {
		const staff = (await staffsService.getOneStaff(["staff_id"], [staffId]))[0];
		req.body["paid_salary"] += parseInt(staff["paid_salary"]);
	}

	req.body.status = true;

	const keys = Object.keys(req.body);
	const values = Object.values(req.body);

	// Kiểm tra nhân viên được cập nhật có thuộc agency của admin 
	const conditionFields = ["staff_id", "agency_id"];
	const conditionValues = [staffId, agencyId];

	try {
		const result = await staffsService.updateStaff(keys, values, conditionFields, conditionValues);

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

const deleteStaff = async (req,res)=>{
	if (!req.isAuthenticated() || req.user.permission < 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không có quyền truy cập tài nguyên này!",
		});
	}

	const userRequestValidation = new controllerUtils.StaffValidation();
	const { error } = userRequestValidation.validateDeletingStaff(req.query);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
	// kiểm tra staffId có thuộc quyền quản lý của agencyId của admin hay không
	const result = await staffsService.deleteStaff(["agency_id", "staff_id"], [req.user.agency_id, req.query.staff_id]);

	if (result[0].affectedRows <= 0) {
		return res.status(200).json({
			error: true,
			message: "Bạn không có quyền truy cập tài nguyên này. ",
		});
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

const updatePassword = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission !== 2) {
		return res.status(401).json({
			error: true,
			message: "Bạn không có quyền truy cập tài nguyên này!",
		});
	}

	const { error } = staffValidation.validateUpdatePassword(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}
	
	const hashedNewPassword = utils.hash(req.body.new_password);

	try {
		await staffsService.updatePassword(["password", "status"], [hashedNewPassword, 1], ["staff_id"], [req.user.staff_id]) ;
		
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
}

const updateAvatar = async (req, res) => {
	if (!req.file) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
		const staff = await staffsService.getOneStaff(["staff_id"], [req.user.staff_id]);
		
		if (staff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bạn không được phép truy cập tài nguyên này.",
			});
		}

		const oldAvatarPath = path.join(__dirname, '..', 'img', 'avatar', staff[0]["avatar"]);

		fs.unlinkSync(oldAvatarPath);

		const result = await staffsService.updateStaff(["avatar"], [req.file.filename], ["staff_id"], [req.user.staff_id]);

		if (result[0].affectedRows <= 0) {
			return res.status(403).json({
				error: true,
				message: "Bạn không có quyền truy cập tài nguyên này.",
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
}

module.exports = {
	checkExistStaff,
	createNewStaff,
	getStaffs,
	updateStaffInfo,
	deleteStaff,
	verifyStaffSuccess,
	verifyStaffFail,
	updatePassword,
	updateAvatar,
};
