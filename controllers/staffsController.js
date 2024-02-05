const staffsService = require ("../services/staffsService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require('path');

const staffValidation = new validation.StaffValidation();

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
	try {
		const { error } = staffValidation.validateCheckingExistStaff(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const existed = await staffsService.checkExistStaff(req.query);
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
	try {
		if (req.user.role === "AGENCY_TELLER" || req.user.role === "COMPLAINTS_SOLVER" || req.user.role === "DRIVER" || req.user.role === "SHIPPER") {
			const { error } = staffValidation.validateFindingStaffByStaff(req.query);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (req.user.staff_id !== req.query.staff_id) {
				return res.status(401).json({
					error: true,
					message: "Bạn không được phép truy cập tài nguyên này.",
				});
			}

			const result = await staffsService.getOneStaff(req.query); 
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}
		else if (req.user.role === "AGENCY_MANAGER") {
			const { error } = staffValidation.validateFindingStaffByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					// message: "Thông tin không hợp lệ.",
					error: error.message,
				});
			}

			req.body.agency_id = req.user.agency_id;

			const result = await staffsService.getManyStaffs(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}
		else if (req.user.role === "ADMIN") {
			const { error } = staffValidation.validateFindingStaffByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: "Thông tin không hợp lệ.",
				});
			}

			const result = await staffsService.getManyStaffs(req.body);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const createNewStaff = async (req, res) => {
	try {
		const { error } = staffValidation.validateCreatingStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const tempUser = new Object({
			username: req.body.username,
			cccd: req.body.cccd,
			email: req.body.email,
			phone_number: req.body.phone_number,
		});

		const checkingExistStaff = await staffsService.checkExistStaff(tempUser);

		if (checkingExistStaff.existed) {
			return res.status(409).json({
				error: true,
				message: checkingExistStaff.message,
			});
		}

		const staffIdSubParts = req.user.staff_id.split('_');
		req.body.staff_id = staffIdSubParts[0] + '_' + staffIdSubParts[1] + '_' + req.body.cccd;
		req.body.agency_id = req.user.agency_id;
		req.body.password = utils.hash(req.body.password);

		if (req.file) {
			req.body.avatar = req.file.filename;
		}

		const resultCreatingNewStaff = await staffsService.createNewStaff(req.body);
		let textResultCreatingNewStaff;

		if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
			textResultCreatingNewStaff = `
			Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu tổng thất bại.\n
			Vui lòng tạo thủ công tài khoản nhân viên với mã nhân viên ${req.body.staff_id} và thông tin đã cung cấp trước đó.`
		}
		else {
			textResultCreatingNewStaff = `Tạo tài khoản nhân viên có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu tổng thành công.`
		}
		
		let textResultCreatingNewStaffInAgency;
		if (req.user.role === "AGENCY_MANAGER") {
			const resultCreatingNewStaffInAgency = await staffsService.createNewStaff(req.body, staffIdSubParts[1]);

			if (!resultCreatingNewStaffInAgency || resultCreatingNewStaffInAgency <= 0) {
				textResultCreatingNewStaffInAgency = `
				Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu bưu cục không thành công.
				Vui lòng tạo thủ công tài khoản nhân viên bưu cục với mã nhân viên ${req.body.staff_id} trong bảng ${staffIdSubParts[1] + '_' + "staff"}.`
			}
			else {
				textResultCreatingNewStaffInAgency = `Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu bưu cục thành công.`
			}
		}

		return res.status(201).json({
			error: false,
			message: `Kết quả:\n
			${textResultCreatingNewStaff}\n
			${textResultCreatingNewStaffInAgency || ""}`,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
};

const updateStaffInfo = async (req, res) => {
	try {
		const { error } = staffValidation.validateQueryUpdatingStaff(req.query) || staffValidation.validateUpdatingStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const updatorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');
		const staffId = req.query.staff_id;
		const agencyId = req.query.agency_id;

		if (updatorIdSubParts[0] === "BC" || updatorIdSubParts[0] === "DL") {
			if (updatorIdSubParts[1] !== staffIdSubParts[1]) {
				return res.status(404).json({
					error: true,
					message: `
					Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
				});
			}
		}

		if (req.body.hasOwnProperty("paid_salary")) {
			const staff = (await staffsService.getOneStaff(["staff_id"], [req.query.staff_id]))[0];
			req.body.paid_salary += parseInt(staff.paid_salary || 0);
		}

		const conditions = new Object({
			staff_id: staffId,
			agency_id: agencyId,
		});

		let textResultUpdatingStaffInAgency;
		if (staffIdSubParts[0] === "BC" || staffIdSubParts[0] === "DL") {
			const resultUpdatingStaffInAgency = await staffsService.updateStaff(req.body, conditions, staffIdSubParts[1]);
			if (!resultUpdatingStaffInAgency || resultUpdatingStaffInAgency.affectedRows <= 0) {
				textResultUpdatingStaffInAgency = `
				Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục không thành công.
				Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${staffIdSubParts[1]}.`
			}
			else {
				textResultUpdatingStaffInAgency = `
				Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục thành công.`;
			}
		}

		let textResultUpdatingStaff;
		const resultUpdatingStaff = await staffsService.updateStaff(req.body, conditions);
		if (!resultUpdatingStaff || resultUpdatingStaff.affectedRows <= 0) {
			textResultUpdatingStaff = `
			Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng không thành công.
			Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong cơ sở dữ liệu tổng.`
		}
		else {
			textResultUpdatingStaff = `
			Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng thành công.`;
		}
	
		res.status(200).json({
			error: false,
			message: `Kết quả:\n
			${textResultUpdatingStaff}\n
			${textResultUpdatingStaffInAgency || ""}`,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: error,
		});
	}
};

const deleteStaff = async (req, res) => {
	try {
		const { error } = staffValidation.validateDeletingStaff(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const deletorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');
		const staffId = req.query.staff_id;
		const agencyId = req.query.agency_id;

		if (deletorIdSubParts[0] === "BC" || deletorIdSubParts[0] === "DL") {
			if (deletorIdSubParts[1] !== staffIdSubParts[1]) {
				return res.status(404).json({
					error: true,
					message: `
					Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${deletorIdSubParts[1]}.`
				});
			}
		}

		const conditions = new Object({
			staff_id: staffId,
			agency_id: agencyId,
		});

		let textResultDeletingStaffInAgency;
		if (staffIdSubParts[0] === "BC" || staffIdSubParts[0] === "DL") {
			const resultUpdatingStaffInAgency = await staffsService.deleteStaff(conditions, staffIdSubParts[1]);
			if (!resultUpdatingStaffInAgency || resultUpdatingStaffInAgency.affectedRows <= 0) {
				textResultDeletingStaffInAgency = `
				Xóa nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục không thành công.
				Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${staffIdSubParts[1]}.`
			}
			else {
				textResultDeletingStaffInAgency = `
				Xóa nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục thành công.`;
			}
		}

		let textResultDeletingStaff;
		const resultDeletingStaff = await staffsService.deleteStaff(conditions);
		if (!resultDeletingStaff || resultDeletingStaff.affectedRows <= 0) {
			textResultDeletingStaff = `
			Xóa nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng không thành công.
			Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong cơ sở dữ liệu tổng.`
		}
		else {
			textResultDeletingStaff = `
			Xóa nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng thành công.`;
		}
	
		res.status(200).json({
			error: false,
			message: `Kết quả:\n
			${textResultDeletingStaff}\n
			${textResultDeletingStaffInAgency || ""}`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error,
		});
	}
}

const updatePassword = async (req, res) => {
	try {
		const { error } = staffValidation.validateUpdatePassword(req.body);

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

		const result = await staffsService.updatePassword(updatedInfo, condition);
		
		if (!result || result.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Cập nhật mật khẩu không thành công. Người dùng không tồn tại."
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

const updateAvatar = async (req, res) => {
	try {
		const staff = await staffsService.getOneStaff({ staff_id: req.user.staff_id });
		
		if (!staff || staff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Người dùng có mã nhân viên ${req.user.staff_id} không tồn tại.`,
			});
		}

		const fileName = staff[0].avatar;

		const tempFolderPath = path.join("storage", "staff", "img", "avatar_temp");
		if (!fs.existsSync(tempFolderPath)) {
			fs.mkdirSync(tempFolderPath);
		}

		const officialFolderPath = path.join("storage", "staff", "img", "avatar");
		if (!fs.existsSync(officialFolderPath)) {
			fs.mkdirSync(officialFolderPath);
		}

		const updatorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');
		const staffId = req.query.staff_id;
		const agencyId = req.query.agency_id;

		if (updatorIdSubParts[0] === "BC" || updatorIdSubParts[0] === "DL") {
			if (updatorIdSubParts[1] !== staffIdSubParts[1]) {
				return res.status(404).json({
					error: true,
					message: `
					Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
				});
			}
		}

		const updatedInfo = new Object({
			avatar: req.file.filename,
		});

		const conditions = new Object({
			staff_id: staffId,
			agency_id: agencyId,
		});

		let textResultUpdatingStaffInAgency;
		if (staffIdSubParts[0] === "BC" || staffIdSubParts[0] === "DL") {
			const resultUpdatingStaffInAgency = await staffsService.updateStaff(updatedInfo, conditions, staffIdSubParts[1]);
			if (!resultUpdatingStaffInAgency || resultUpdatingStaffInAgency.affectedRows <= 0) {
				textResultUpdatingStaffInAgency = `
				Cập nhật ảnh đại diện nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục không thành công.
				Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${staffIdSubParts[1]}.`
			}
			else {
				textResultUpdatingStaffInAgency = `
				Cập nhật ảnh đại diện nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục thành công.`;
			}
		}

		let textResultUpdatingStaff;
		const resultUpdatingStaff = await staffsService.updateStaff(updatedInfo, conditions);
		if (!resultUpdatingStaff || resultUpdatingStaff.affectedRows <= 0) {
			textResultUpdatingStaff = `
			Cập nhật ảnh đại diện nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng không thành công.
			Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong cơ sở dữ liệu tổng.`
		}
		else {
			textResultUpdatingStaff = `
			Cập nhật ảnh đại diện nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng thành công.`;
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

		res.status(201).json({
			error: false,
			message: `Kết quả:\n
			${textResultUpdatingStaff}\n
			${textResultUpdatingStaffInAgency || ""}`,
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
