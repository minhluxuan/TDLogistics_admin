const staffsService = require ("../services/staffsService");
const agencyService = require("../services/agenciesService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require('path');

const staffValidation = new validation.StaffValidation();

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
		if (["ADMIN", "MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role) || req.user.privileges.includes(15)) {
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

		if (["AGENCY_MANAGER"].includes(req.user.role) || req.user.privileges.includes(14)) {
			const { error } = staffValidation.validateFindingStaffByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
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

		const { error } = staffValidation.validateFindingStaffByStaff(req.body);

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

		const result = await staffsService.getOneStaff(req.body); 
		return res.status(200).json({
			error: false,
			data: result,
			message: "Lấy thông tin thành công.",
		});
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
		if (["ADMIN", "MANAGER"].includes(req.user.role) || req.user.privileges.includes(12)) {
			const { error } = staffValidation.validateCreatingStaffByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (!(await agencyService.checkExistAgency({ agency_id: req.body.agency_id }))) {
				return res.status(404).json({
					error: true,
					message: `Bưu cục có mã bưu cục ${req.body.agency_id} không tồn tại.`,
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

			const agencyIdSubParts = req.body.agency_id.split('_');
			req.body.staff_id = agencyIdSubParts[0] + '_' + agencyIdSubParts[1] + '_' + req.body.cccd;
			req.body.password = utils.hash(req.body.password);

			if (req.file) {
				req.body.avatar = req.file.filename;
			}

			const resultCreatingNewStaff = await staffsService.createNewStaff(req.body);

			if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
				return res.status(409).json({
					error: false,
					message: `Kết quả:\n
					Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu tổng thất bại.`,
				});
			}
			else {
				return res.status(201).json({
					error: false,
					message: `Kết quả:\n
					Tạo tài khoản nhân viên có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu tổng thành công.`,
				});
			}
		}

		if (["AGENCY_MANAGER"].includes(req.user.role) || req.user.privileges.includes(11)) {
			const { error } = staffValidation.validateCreatingStaffByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (!(await agencyService.checkExistAgency({ agency_id: req.body.agency_id }))) {
				return res.status(404).json({
					error: true,
					message: `Bưu cục có mã bưu cục ${req.body.agency_id} không tồn tại.`,
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

			const creatorIdSubParts = req.user.agency_id.split('_');
			req.body.staff_id = creatorIdSubParts[0] + '_' + creatorIdSubParts[1] + '_' + req.body.cccd;
			req.body.password = utils.hash(req.body.password);

			if (req.file) {
				req.body.avatar = req.file.filename;
			}

			const resultCreatingNewStaff = await staffsService.createNewStaff(req.body);

			if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
				return res.status(409).json({
					error: false,
					message: `Kết quả:\n
					Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu tổng thất bại.`,
				});
			}
			else {
				return res.status(201).json({
					error: false,
					message: `Kết quả:\n
					Tạo tài khoản nhân viên có mã nhân viên ${req.body.staff_id} trong cơ sở dữ liệu tổng thành công.`,
				});
			}
		}
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

		if ((req.user.role === "AGENCY_MANAGER" || req.user.privileges.includes(16)) && req.user.agency_id !== agencyId) {
			return res.status(404).json({
				error: true,
				message: `
				Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
			});
		}

		if (req.body.hasOwnProperty("paid_salary")) {
			const staff = (await staffsService.getOneStaff({ staff_id: req.query.staff_id }))[0];
			req.body.paid_salary += parseInt(staff.paid_salary || 0);
		}

		const conditions = new Object({
			staff_id: staffId,
			agency_id: agencyId,
		});

		const resultUpdatingStaff = await staffsService.updateStaff(req.body, conditions);
		if (!resultUpdatingStaff || resultUpdatingStaff.affectedRows <= 0) {
			return res.status(409).json({
				error: false,
				message: `Kết quả:\n
				Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng thất bại.`,
			});
		}
		else {
			return res.status(201).json({
				error: false,
				message: `Kết quả:\n
				Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng thành công.`,
			});
		}
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

		if ((req.user.role === "AGENCY_MANAGER" || req.user.privileges.includes(16)) && req.user.agency_id !== agencyId) {
			return res.status(404).json({
				error: true,
				message: `
				Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
			});
		}

		const conditions = new Object({
			staff_id: staffId,
			agency_id: agencyId
		});

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
			${textResultDeletingStaff}\n`,
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
		const { error } = staffValidation.validateQueryUpdatingStaff(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const resultGettingOneStaff = await staffsService.getOneStaff({ staff_id: req.user.staff_id, agency_id: req.user.agency_id });
		
		if (!resultGettingOneStaff || resultGettingOneStaff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Người dùng có mã nhân viên ${req.user.staff_id} không tồn tại.`,
			});
		}

		const staff = resultGettingOneStaff[0];
		const fileName = staff.avatar;

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

		if ((req.user.role === "AGENCY_MANAGER" || req.user.privileges.includes(16)) && req.user.agency_id !== agencyId) {
			return res.status(404).json({
				error: true,
				message: `
				Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
			});
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
	updatePassword,
	updateAvatar,
};
