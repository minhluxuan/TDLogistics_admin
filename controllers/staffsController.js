const staffsService = require ("../services/staffsService");
const agencyService = require("../services/agenciesService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");
const fs = require("fs");
const path = require('path');
const { object } = require("joi");

const staffValidation = new validation.StaffValidation();

const userCannotBeAffected = ["TD_00000_077165007713"];

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

const getAuthenticatedStaffInfo = async (req, res) => {
	try {
		const resultGettingOneStaff = await staffsService.getOneStaff({ staff_id: req.user.staff_id });
		if (!resultGettingOneStaff || resultGettingOneStaff.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã ${req.user.staff_id} không tồn tại.`
			});
		}

		return res.status(200).json(new Object({
			error: false,
			info: resultGettingOneStaff[0],
			message: `Lấy thông tin người dùng thành công`,
		}));
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getStaffs = async (req, res) => {
	try {
		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role)) {
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

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
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

		if (req.user.staff_id !== req.body.staff_id) {
			return res.status(403).json({
				error: true,
				message: "Người dùng không được phép truy cập tài nguyên này.",
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
		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
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
					message: `Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} thất bại.`,
				});
			}

			if (req.file) {
				const tempFolderPath = path.join("storage", "staff", "img", "avatar_temp");
				if (!fs.existsSync(tempFolderPath)) {
					fs.mkdirSync(tempFolderPath);
				}

				const officialFolderPath = path.join("storage", "staff", "img", "avatar");
				if (!fs.existsSync(officialFolderPath)) {
					fs.mkdirSync(officialFolderPath);
				}

				const tempFilePath = path.join(tempFolderPath, req.file.filename);
				const officialFilePath = path.join(officialFolderPath, req.file.filename);

				fs.renameSync(tempFilePath, officialFilePath);
			}

			return res.status(201).json({
				error: false,
				message: `Tạo tài khoản nhân viên có mã nhân viên ${req.body.staff_id} thành công.`,
			});
		}

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const { error } = staffValidation.validateCreatingStaffByAgency(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (!(await agencyService.checkExistAgency({ agency_id: req.user.agency_id }))) {
				return res.status(404).json({
					error: true,
					message: `Bưu cục có mã bưu cục ${req.user.agency_id} không tồn tại.`,
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
			req.body.agency_id = req.user.agency_id;

			if (req.file) {
				req.body.avatar = req.file.filename;
			}

			const resultCreatingNewStaff = await staffsService.createNewStaff(req.body);

			if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
				return res.status(409).json({
					error: false,
					message: `Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} thất bại.`,
				});
			}

			if (req.file) {
				const tempFolderPath = path.join("storage", "staff", "img", "avatar_temp");
				if (!fs.existsSync(tempFolderPath)) {
					fs.mkdirSync(tempFolderPath);
				}

				const officialFolderPath = path.join("storage", "staff", "img", "avatar");
				if (!fs.existsSync(officialFolderPath)) {
					fs.mkdirSync(officialFolderPath);
				}

				const tempFilePath = path.join(tempFolderPath, req.file.filename);
				const officialFilePath = path.join(officialFolderPath, req.file.filename);

				fs.renameSync(tempFilePath, officialFilePath);
			}

			return res.status(201).json({
				error: false,
				message: `Tạo tài khoản nhân viên có mã nhân viên ${req.body.staff_id} thành công.`,
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

const updateStaffInfo = async (req, res) => {
	try {
		const { error } = staffValidation.validateQueryUpdatingStaff(req.query) || staffValidation.validateUpdatingStaff(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (userCannotBeAffected.includes(req.query.staff_id)) {
			return res.status(403).json({
				error: true,
				message: "Người dùng không được phép truy cập tài nguyên này.",
			});
		}

		const updatorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');

		if (["AGENCY_MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
			&& (updatorIdSubParts[0] !== staffIdSubParts[0]
			|| updatorIdSubParts[1] !== staffIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
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
			const resultCheckingExistStaff = await staffsService.checkExistStaff(tempUser);
			
			if (resultCheckingExistStaff.existed) {
				return res.status(409).json({
					error: true,
					message: resultCheckingExistStaff.message,
				});
			}
		}

		if (req.body.hasOwnProperty("paid_salary")) {
			const resultGettingOneStaff = (await staffsService.getOneStaff({ staff_id: req.query.staff_id }))[0];
			if (!resultGettingOneStaff || resultGettingOneStaff.length <= 0) {
				return res.status(404).json({
					error: true,
					message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`
				})
			}

			const staff = resultGettingOneStaff[0];
			req.body.paid_salary += parseInt(staff.paid_salary || 0);
		}

		const resultUpdatingStaff = await staffsService.updateStaff(req.body, { staff_id: req.query.staff_id });
		if (!resultUpdatingStaff || resultUpdatingStaff.affectedRows <= 0) {
			return res.status(404).json({
				error: false,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
			});
		}

		return res.status(201).json({
			error: false,
			message: `Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} thành công.`,
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

		if (userCannotBeAffected.includes(req.query.staff_id)) {
			return res.status(403).json({
				error: true,
				message: "Người dùng không được phép truy cập tài nguyên này.",
			});
		}

		const deletorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');

		if (["AGENCY_MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
			&& (deletorIdSubParts[0] !== staffIdSubParts[0]
			|| deletorIdSubParts[1] !== staffIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${deletorIdSubParts[1]}.`
			});
		}

		const resultGettingOneStaff = await staffsService.getOneStaff(req.query);
		if (!resultGettingOneStaff || resultGettingOneStaff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`
			});
		}

		const staff = resultGettingOneStaff[0];
		const avatar = staff.avatar;

		const resultDeletingStaff = await staffsService.deleteStaff({ staff_id: req.query.staff_id });
		if (!resultDeletingStaff || resultDeletingStaff.affectedRows <= 0) {
			return res.status(200).json({
				error: false,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
			});
		}
	
		if (avatar) {
			const folderPath = path.join("storage", "staff", "img", "avatar");
			if (!fs.existsSync(folderPath)) {
				fs.mkdirSync(folderPath);
			}

			const avatarPath = path.join(folderPath, avatar);
			if (fs.existsSync(avatarPath)) {
				fs.unlinkSync(avatarPath);
			}
		}

		return res.status(200).json({
			error: false,
			message: `Xóa nhân viên có mã nhân viên ${req.query.staff_id} thành công.`,
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

		if (userCannotBeAffected.includes(req.query.staff_id)) {
			return res.status(403).json({
				error: true,
				message: "Người dùng không được phép truy cập tài nguyên này.",
			});
		}
		
		const updatedInfo = new Object({
			password: utils.hash(req.body.new_password),
			active: true,
		});

		const result = await staffsService.updatePassword(updatedInfo, { staff_id: req.user.staff_id });
		
		if (!result || result.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.user.staff_id} không tồn tại.`,
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

		if (userCannotBeAffected.includes(req.query.staff_id)) {
			return res.status(403).json({
				error: true,
				message: "Người dùng không được phép truy cập tài nguyên này.",
			});
		}

		const updatorIdSubParts = req.user.staff_id.split('_');
		const staffIdSubParts = req.query.staff_id.split('_');

		if (["AGENCY_MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)
			&& (updatorIdSubParts[0] !== staffIdSubParts[0]
			|| updatorIdSubParts[1] !== staffIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${updatorIdSubParts[1]}.`
			});
		}

		const resultGettingOneStaff = await staffsService.getOneStaff({ staff_id: req.query.staff_id });
		
		if (!resultGettingOneStaff || resultGettingOneStaff.length <= 0) {
			return res.status(404).json({
				error: true,
				message: `Người dùng có mã nhân viên ${req.user.staff_id} không tồn tại.`,
			});
		}

		const staff = resultGettingOneStaff[0];
		const fileName = staff.avatar;

		const resultUpdatingStaff = await staffsService.updateStaff({ avatar: req.file.filename }, { staff_id: req.query.staff_id });
		if (!resultUpdatingStaff || resultUpdatingStaff.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
			});
		}

		const tempFolderPath = path.join("storage", "staff", "img", "avatar_temp");
		if (!fs.existsSync(tempFolderPath)) {
			fs.mkdirSync(tempFolderPath);
		}

		const officialFolderPath = path.join("storage", "staff", "img", "avatar");
		if (!fs.existsSync(officialFolderPath)) {
			fs.mkdirSync(officialFolderPath);
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
			message: `Cập nhật ảnh đại diện cho nhân viên có mã nhân viên ${req.query.staff_id} thành công.`,
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
	getAuthenticatedStaffInfo,
	getStaffs,
	updateStaffInfo,
	deleteStaff,
	updatePassword,
	updateAvatar,
};
