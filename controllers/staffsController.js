const staffsService = require ("../services/staffsService");
const agencyService = require("../services/agenciesService");
const administrativeService = require("../services/administrativeService");
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
		const resultGettingStaffInfo = await staffsService.getOneStaff({ staff_id: req.user.staff_id });
		if (!resultGettingStaffInfo || resultGettingStaffInfo.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên có mã ${req.user.staff_id} không tồn tại.`,
			});
		}
		
		const staff = resultGettingStaffInfo[0];

		const info = new Object({
			staff_id: req.user.staff_id,
			fullname: staff.fullname,
			role: req.user.role,
			position: staff.position,
			cccd: staff.cccd,
			phone_number: staff.phone_number,
			agency_id: req.user.agency_id,
			privileges: req.user.privileges,
			active: req.user.active,
		});
		return res.status(200).json(new Object({
			error: false,
			info: staff,
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
		const paginationConditions = { rows: 0, page: 0 };

        if (req.query.rows) {
            paginationConditions.rows = parseInt(req.query.rows);
        }

        if (req.query.page) {
            paginationConditions.page = parseInt(req.query.page);
        }

        const { error: paginationError } = staffValidation.validatePaginationConditions(paginationConditions);
        if (paginationError) {
            return res.status(400).json({
                error: true,
                message: paginationError.message,
            });
        }
		
		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role)) {
			const { error } = staffValidation.validateFindingStaffByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: "Thông tin không hợp lệ.",
				});
			}

			const result = await staffsService.getManyStaffs(req.body, paginationConditions);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		}

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const { error } = staffValidation.validateFindingStaffByAdmin(req.body, paginationConditions);

			if (error) {
				return res.status(400).json({
					error: true,
					error: error.message,
				});
			}

			req.body.agency_id = req.user.agency_id;

			const result = await staffsService.getManyStaffs(req.body, paginationConditions);
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

			if (["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role) && (!req.body.hasOwnProperty("managed_wards") || req.body.managed_wards.length === 0)) {
				return res.status(400).json({
					error: true,
					message: `Trường managed_wards không được để trống.`,
				});
			}

			if (!["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role) && req.body.hasOwnProperty("managed_wards")) {
				return res.status(400).json({
					error: true,
					message: `Trường managed_wards không được cho phép.`,
				});
			}

			const resultGettingOneAgency = await agencyService.getOneAgency({ agency_id: req.body.agency_id });

			if (!resultGettingOneAgency || resultGettingOneAgency.length === 0) {
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

			const managedWards = req.body.managed_wards;
			if (["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role)) {
				let possibleManagedWard;
				try {
					possibleManagedWard = JSON.parse(resultGettingOneAgency[0].managed_wards);
					if (possibleManagedWard.length === 0) {
						return res.status(404).json({
							error: true,
							message: `Bưu cục/Đại lý ${req.body.agency_id} chưa quản lý phường/xã/thị trấn nào để để có thể phân vùng cho shipper.`,
						});
					}
				} catch (error) {
					return res.status(404).json({
						error: true,
						message: `Bưu cục/Đại lý ${req.body.agency_id} chưa quản lý phường/xã/thị trấn nào để để có thể phân vùng cho shipper.`,
					});
				}
				
				for (const ward of req.body.managed_wards) {
					if (!possibleManagedWard.includes(ward)) {
						return res.status(400).json({
							error: true,
							message: `${ward}, ${resultGettingOneAgency[0].district}, ${resultGettingOneAgency[0].province} không thuộc quyền quản lý của bưu bưu cục ${req.body.agency_id}.`,
						});
					}
				}

				for (const ward of req.body.managed_wards) {
					const resultGettingWardsManagedByShipper = await administrativeService.getOneAdministrativeUnit({ province: resultGettingOneAgency[0].province, district: resultGettingOneAgency[0].district, ward: ward });
					if (resultGettingWardsManagedByShipper.length > 0 && resultGettingWardsManagedByShipper[0].shipper) {
						return res.status(409).json({
							error: true,
							message: `${ward} đã được đảm nhận bởi shipper ${resultGettingWardsManagedByShipper[0].shipper}.`,
						});
					} 
				}

				delete req.body.managed_wards;
			}

			const resultCreatingNewStaff = await staffsService.createNewStaff(req.body);

			if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
				return res.status(409).json({
					error: false,
					message: `Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} thất bại.`,
				});
			}

			if (["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role) && managedWards) {
				for (const ward of managedWards) {
					console.log(await administrativeService.updateOneAdministrativeUnit({ province: resultGettingOneAgency[0].province, district: resultGettingOneAgency[0].district, ward: ward }, {shipper: req.body.staff_id }));
				}
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

			if (["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role) && (!req.body.hasOwnProperty("managed_wards") || req.body.managed_wards.length === 0)) {
				return res.status(400).json({
					error: true,
					message: `Trường managed_wards không được để trống.`,
				});
			}

			if (!["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role) && req.body.hasOwnProperty("managed_wards")) {
				return res.status(400).json({
					error: true,
					message: `Trường managed_wards không được cho phép.`,
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

			const managedWards = req.body.managed_wards;
			if (["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role)) {
				let possibleManagedWard;
				try {
					possibleManagedWard = JSON.parse(resultGettingOneAgency[0].managed_wards);
					if (possibleManagedWard.length === 0) {
						return res.status(404).json({
							error: true,
							message: `Bưu cục/Đại lý ${req.body.agency_id} chưa quản lý phường/xã/thị trấn nào để để có thể phân vùng cho shipper.`,
						});
					}
				} catch (error) {
					return res.status(404).json({
						error: true,
						message: `Bưu cục/Đại lý ${req.body.agency_id} chưa quản lý phường/xã/thị trấn nào để để có thể phân vùng cho shipper.`,
					});
				}

				for (const ward of req.body.managed_wards) {
					if (!possibleManagedWard.includes(ward)) {
						return res.status(400).json({
							error: true,
							message: `${ward}, ${resultGettingOneAgency[0].district}, ${resultGettingOneAgency[0].province} không thuộc quyền quản lý của bưu bưu cục ${req.body.agency_id}.`,
						});
					}
				}

				for (const ward of req.body.managed_wards) {
					const resultGettingWardsManagedByShipper = await administrativeService.getOneAdministrativeUnit({ province: resultGettingOneAgency[0].province, district: resultGettingOneAgency[0].district, ward: ward });
					if (resultGettingWardsManagedByShipper.length > 0 && resultGettingWardsManagedByShipper[0].shipper) {
						return res.status(409).json({
							error: true,
							message: `${ward} đã được đảm nhận bởi shipper ${resultGettingWardsManagedByShipper[0].shipper}.`,
						});
					} 
				}

				delete req.body.managed_wards;
			}

			const resultCreatingNewStaff = await staffsService.createNewStaff(req.body);

			if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
				return res.status(409).json({
					error: false,
					message: `Tạo tài khoản nhân viên bưu cục có mã nhân viên ${req.body.staff_id} thất bại.`,
				});
			}

			if (["SHIPPER", "AGENCY_SHIPPER"].includes(req.body.role) && managedWards) {
				for (const ward of managedWards) {
					await administrativeService.updateOneAdministrativeUnit({ province: resultGettingOneAgency[0].province, district: resultGettingOneAgency[0].district, ward: ward }, {shipper: req.body.staff_id });
				}
			}

			if (req.file) {
				const tempFolderPath = path.join("storage", "staff", "img", "avatar_temp");
				if (!fs.existsSync(tempFolderPath)) {
					fs.mkdirSync(tempFolderPath);
				}s

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
			return res.status(400).json({
				error: true,
				message: `Nhân viên có mã ${req.query.staff_id} không thể bị tác động.`,
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
			else {
				tempUser[prop] = null;
			}
		}

		if (Object.keys(tempUser).length > 0) {
			const resultCheckingExistStaff = await staffsService.checkExistStaffWithDifferentStaffId(tempUser, req.query.staff_id);
			
			if (resultCheckingExistStaff.existed) {
				return res.status(409).json({
					error: true,
					message: resultCheckingExistStaff.message,
				});
			}
		}

		let managedWards = null;
		let agencyInfo = null;
		if (req.body.hasOwnProperty("paid_salary") || req.body.hasOwnProperty("managed_wards")) {
			const resultGettingOneStaff = await staffsService.getOneStaff({ staff_id: req.query.staff_id });
			if (!resultGettingOneStaff || resultGettingOneStaff.length === 0) {
				return res.status(404).json({
					error: true,
					message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`
				});
			}

			if (!["SHIPPER", "AGENCY_SHIPPER"].includes(resultGettingOneStaff[0].role) && req.body.hasOwnProperty("managed_wards")) {
				return res.status(404).json({
					error: true,
					message: `Trường managed_wards không được cho phép.`,
				});
			}

			if (["SHIPPER", "AGENCY_SHIPPER"].includes(resultGettingOneStaff[0].role) && req.body.hasOwnProperty("managed_wards")) {
				managedWards = req.body.managed_wards;
				const resultGettingOneAgency = await agencyService.getOneAgency({ agency_id: resultGettingOneStaff[0].agency_id });
				if (!resultGettingOneAgency || resultGettingOneAgency[0].length === 0) {
					return res.status(404).json({
						error: true,
						message: `Bưu cục ${resultGettingOneStaff[0].agency_id} của nhân viên ${resultGettingOneStaff[0].staff_id} không tồn tại. Hãy thử kiểm tra lại.`,
					});
				}
				
				agencyInfo = resultGettingOneAgency[0];
				let possibleManagedWard;
				try {
					possibleManagedWard = JSON.parse(resultGettingOneAgency[0].managed_wards);
					if (possibleManagedWard.length === 0) {
						return res.status(404).json({
							error: true,
							message: `Bưu cục/Đại lý ${req.body.agency_id} chưa quản lý phường/xã/thị trấn nào để để có thể phân vùng cho shipper.`,
						});
					}
				} catch (error) {
					return res.status(404).json({
						error: true,
						message: `Bưu cục/Đại lý ${req.body.agency_id} chưa quản lý phường/xã/thị trấn nào để để có thể phân vùng cho shipper.`,
					});
				}

				for (const ward of req.body.managed_wards) {
					if (!possibleManagedWard.includes(ward)) {
						return res.status(400).json({
							error: true,
							message: `${ward}, ${resultGettingOneAgency[0].district}, ${resultGettingOneAgency[0].province} không thuộc quyền quản lý của bưu bưu cục ${resultGettingOneAgency[0].agency_id}.`,
						});
					}
				}

				for (const ward of req.body.managed_wards) {
					const resultGettingWardsManagedByShipper = await administrativeService.getOneAdministrativeUnit({ province: resultGettingOneAgency[0].province, district: resultGettingOneAgency[0].district, ward: ward });
					if (resultGettingWardsManagedByShipper.length > 0 && resultGettingWardsManagedByShipper[0].shipper && resultGettingWardsManagedByShipper[0].shipper !== req.query.staff_id) {
						return res.status(409).json({
							error: true,
							message: `${ward} đã được đảm nhận bởi shipper ${resultGettingWardsManagedByShipper[0].shipper}.`,
						});
					} 
				}

				delete req.body.managed_wards;
			}

			if (req.body.hasOwnProperty("paid_salary")) {
				const staff = resultGettingOneStaff[0];
				req.body.paid_salary += parseInt(staff.paid_salary || 0);
			}
		}

		if (Object.keys(req.body).length > 0) {
			const resultUpdatingStaff = await staffsService.updateStaff(req.body, { staff_id: req.query.staff_id });
			if (!resultUpdatingStaff || resultUpdatingStaff.affectedRows === 0) {
				return res.status(404).json({
					error: false,
					message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
				});
			}
		}

		if (managedWards && managedWards.length > 0) {
			for (const ward of managedWards) {
				await administrativeService.updateOneAdministrativeUnit({ province: agencyInfo.province, district: agencyInfo.district, ward: ward }, {shipper: req.query.staff_id });
			}
		}

		const resultGettingAdministrativeUnit = await administrativeService.getAdministrativeUnit({ shipper: req.query.staff_id });
		const previousManagedWards = resultGettingAdministrativeUnit.map(elm => elm.ward);
		const removedWards = previousManagedWards.filter(ward => !managedWards.includes(ward));

		for (const ward of removedWards) {
			await administrativeService.updateOneAdministrativeUnit({ province: agencyInfo.province, district: agencyInfo.district, ward: ward }, {shipper: null });
		}

		return res.status(201).json({
			error: false,
			message: `Cập nhật thông tin nhân viên có mã nhân viên ${req.query.staff_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			error: true,
			message: error.message,
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
			return res.status(400).json({
				error: true,
				message: `Nhân viên có mã ${req.query.staff_id} không thể bị tác động.`,
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

const logout = (req, res) => {
	try {
		req.logout(() => {
			req.session.destroy();
		});

		return res.status(200).json({
			error: false,
			message: "Đăng xuất thành công.",
		});
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: "Đăng xuất thất bại."
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
			return res.status(400).json({
				error: true,
				message: `Nhân viên có mã ${req.query.staff_id} không thể bị tác động.`,
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

		// if (userCannotBeAffected.includes(req.query.staff_id)) {
		// 	return res.status(400).json({
		// 		error: true,
		// 		message: `Nhân viên có mã ${req.query.staff_id} không thể bị tác động.`,
		// 	});
		// }

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

const getStaffAvatar = async (req, res) => {
	try {
		const { error } = staffValidation.validateGettingStaffAvatar(req.query);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER"].includes(req.user.role)) {
			const resultGettingOneStaff = await staffsService.getOneStaff(req.body); 
			const staff = resultGettingOneStaff[0];
			const fileName = staff.avatar ? staff.avatar : null;
			
			if (fileName) {
				const file = path.join(__dirname, "..", "storage", "staff", "img", "avatar", fileName);
				if (fs.existsSync(file)) {
					return res.status(200).sendFile(file);
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});
		}

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			req.body.agency_id = req.user.agency_id;

			const resultGettingOneStaff = await staffsService.getOneStaff(req.body); 
			const staff = resultGettingOneStaff[0];
			const fileName = staff.avatar ? staff.avatar : null;
	
			if (fileName) {
				const file = path.join(__dirname,"..","storage", "staff", "img", "avatar", fileName);
				if (fs.existsSync(file)) {
						return res.status(200).sendFile(file);
				}
			}

			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
			});
		}
		else {
			if (req.user.staff_id !== req.body.staff_id) {
				return res.status(403).json({
					error: true,
					message: "Người dùng không được phép truy cập tài nguyên này.",
				});
			}
	
			const resultGettingOneStaff = await staffsService.getOneStaff(req.body); 
			const staff = resultGettingOneStaff[0];
			const fileName = staff.avatar ? staff.avatar : null;
	
			if (fileName) {
				const file = path.join(__dirname, "..", "storage", "staff", "img", "avatar", fileName);
				if (fs.existsSync(file)) {
						return res.status(200).sendFile(file);
				}
			}
			
			return res.status(404).json({
				error: true,
				message: "Không tìm thấy dữ liệu",
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

const removeManagedWards = async (req, res) => {
	try {
		const { error: error1 } = staffValidation.validateDeletingStaff(req.query);
		if (error1) {
			return res.status(400).json({
				error: true,
				message: error1.message,
			});
		}

		const { error: error2 } = staffValidation.validateRemovingManagedWards(req.body);
		if (error2) {
			return res.status(400).json({
				error: true,
				message: error2.message,
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
		if (!resultGettingOneStaff || resultGettingOneStaff.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên ${req.query.staff_id} không tồn tại.`,
			});
		}

		if (!["SHIPPER", "AGENCY_SHIPPER"].includes(resultGettingOneStaff[0].role)) {
			return res.status(400).json({
				error: true,
				message: `Thao tác không thể thực hiện với nhân viên ${req.query.staff_id}.`,
			});
		}

		const resultGettingOneAgency = await agencyService.getOneAgency({ agency_id: resultGettingOneStaff[0].agency_id });
		if (!resultGettingOneAgency || resultGettingOneAgency.length === 0) {
			return res.status(404).json({
				error: true,
				message: `Bưu cục ${resultGettingOneStaff[0].agency_id} của nhân viên ${req.query.staff_id} không tồn tại. Vui lòng kiểm tra lại.`,
			});
		}

		const uniqueRemovedWards = Array.from(new Set(req.body.removed_wards));

		const filteredWards = [];
		for (const ward of uniqueRemovedWards) {
			const resultGettingOneAdministrativeUnit = await administrativeService.getOneAdministrativeUnit({
				province: resultGettingOneAgency[0].province,
				district: resultGettingOneAgency[0].district,
				ward: ward,
				shipper: req.query.staff_id
			});

			if (resultGettingOneAdministrativeUnit && resultGettingOneAdministrativeUnit.length > 0) {
				filteredWards.push(ward);
			}
		}

		for (const ward of filteredWards) {
			await administrativeService.updateOneAdministrativeUnit({ province: resultGettingOneAgency[0].province, district: resultGettingOneAgency[0].district, ward: ward, shipper: req.query.staff_id }, { shipper: null });
		}

		return res.status(200).json({
			error: true,
			message: `Xoá các khu vực đã được đảm nhận bởi shipper ${req.query.staff_id} thành công.`,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const getShipperManagedWards = async (req, res) => {
	try {
		const { error } = staffValidation.validateFindingStaffByStaff(req.query);
		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		if (!(await staffsService.checkExistStaff(req.query))) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên ${req.query.staff_id} không tồn tại.`,
			});
		}

		const resultGettingShipperManagedWards = await staffsService.getShipperManagedWards(req.query.staff_id);

		const managedWards = new Array();
		for (const elm of resultGettingShipperManagedWards) {
			managedWards.push(elm.ward);
		}

		return res.status(200).json({
			error: false,
			data: managedWards,
			message: "Lấy các phường/xã/thị trấn được đảm nhận bởi shipper thành công",
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
	checkExistStaff,
	createNewStaff,
	getAuthenticatedStaffInfo,
	getStaffs,
	updateStaffInfo,
	deleteStaff,
	logout,
	updatePassword,
	updateAvatar,
	getStaffAvatar,
	removeManagedWards,
	getShipperManagedWards,
};
