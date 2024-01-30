const agenciesService = require ("../services/agenciesService");
const staffsService = require("../services/staffsService");
const logger = require("../lib/logger");
const utils = require("../lib/utils");
const validation = require("../lib/validation");

const agencyValidation = new validation.AgencyValidation();

const checkExistAgency = async (req, res) => {
	const { error } = agencyValidation.validateCheckingExistAgency(req.query);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
		const existed = await agenciesService.checkExistAgency(req.query);
		return res.status(200).json({
			error: false,
			existed: existed,
			message: existed ? "Bưu cục đã tồn tại." : "Bưu cục chưa tồn tại.",
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
		const { error } = agencyValidation.validateFindingAgency(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const result = await agenciesService.getAgencies(req.body);

		if (!result) {
			throw new Error("Đã xảy ra lỗi. Lấy thông tin đại lý không thành công. Vui lòng thử lại.");
		}

		return res.status(200).json({
			error: false,
			data: result,
			message: "Lấy thông tin đại lý thành công.",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const createNewAgency = async (req, res) => {
	try {
		const { error } = agencyValidation.validateCreatingAgency(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}

		const checkingPostalCode = await agenciesService.checkPostalCode(req.body.level, req.body.province, req.body.district, req.body.postal_code);

		if (!checkingPostalCode.success) {
			return res.status(400).json({
				error: true,
				message: checkingPostalCode.message,
			});
		}

		const creatorId = req.user.staff_id;
		const action = agencyValidation.isAllowedToCreate(creatorId, req.body);

		if (!action.allowed) {
			return res.status(400).json({
				error: true,
				message: action.message,
			});
		}

		const tempUser = new Object({
			username: req.body.username,
			cccd: req.body.cccd,
			phone_number: req.body.phone_number,
			email: req.body.phone_number,
		});

		const resultCheckingExistStaff = await staffsService.checkExistStaff(tempUser);

		if (resultCheckingExistStaff.existed) {
			return res.status(409).json({
				error: true,
				message: resultCheckingExistStaff.message,
			});
		}

		const resultCreatingAgencyId = await agenciesService.generateAgencyID(req.user.staff_id.split('_')[0], req.body.level, req.body.postal_code);

		if (!resultCreatingAgencyId.success) {
			return res.status(400).json({
				error: true,
				message: resultCreatingAgencyId.message,
			});
		}

		req.body.user_password = utils.hash(req.body.user_password);

		const newStaff = new Object({
			agency_id: resultCreatingAgencyId.agency_id,
			staff_id: resultCreatingAgencyId.agency_id,
			username: req.body.username,
			password: req.body.user_password,
			fullname: req.body.user_fullname || null,
			phone_number: req.body.user_phone_number || null,
			email: req.body.user_email || null,
			date_of_birth: req.body.user_date_of_birth || null,
			cccd: req.body.user_cccd || null,
			address: req.body.user_address || null,
			role: agencyValidation.getRoleFromLevel(req.body.level),
			position: req.body.user_position || null,
			bin: req.body.user_bin || null,
			bank: req.body.user_bank || null,
			salary: req.body.salary || null,
			active: false,
		});

		const resultCreatingNewStaff = await staffsService.createNewStaff(newStaff);
		
		if (!resultCreatingNewStaff || resultCreatingNewStaff[0].affectedRows <= 0) {
			throw new Error("Đã xảy ra lỗi. Tạo người dùng không thành công. Vui lòng thử lại.");
		}

		const newAgency = new Object({
			level: req.body.level,
			agency_id: resultCreatingAgencyId.agency_id,
			postal_code: req.body.postal_code,
			agency_name: req.body.agency_name,
			address: req.body.address,
			province: req.body.province,
			district: req.body.district,
			town: req.body.town,
			latitude: req.body.latitude,
			longitude: req.body.longitude,
			managed_areas: req.body.managed_areas ? JSON.stringify(req.body.managed_areas) : JSON.stringify(new Array()),
			phone_number: req.body.phone_number,
			email: req.body.email,
			commission_rate: req.body.commission_rate,
			bin: req.body.bin || null,
			bank: req.body.bank || null,
		});

		const resultCreatingNewAgency = await agenciesService.createNewAgency(newAgency);

		if (!resultCreatingNewAgency || resultCreatingNewAgency[0].affectedRows <= 0) {
			throw new Error("Đã xảy ra lỗi. Tạo bưu cục mới không thành công. Vui lòng thử lại.");
		}

		const resultCreatingTablesForAgency = await agenciesService.createTablesForAgency(req.body.postal_code);
		
		if (!resultCreatingTablesForAgency.success) {
			throw new Error(resultCreatingTablesForAgency.message);
		}

		const resultCreatingNewStaffInAgency = await staffsService.createNewStaff(newStaff, req.body.postal_code);

		if (!resultCreatingNewStaffInAgency || resultCreatingNewStaffInAgency[0].affectedRows <= 0) {
			throw new Error(`Đã xảy ra lỗi. Tạo một nhân viên trong bưu cục có mã bưu chính ${req.body.postal_code} không thành công. Vui lòng thử lại.`);
		}

		if (req.body.level === 4) {
			const result = await agenciesService.locateAgencyInArea(0, req.body.postal_code.slice(0, 2), resultCreatingAgencyId.agency_id);

			if (!result || result[0].affectedRows <= 0) {
				return res.status(404).json({
					error: true,
					message: `Tỉnh/thành phố có mã bưu chính bắt đầu với ${req.body.postal_code.slice(0, 2)} không tồn tại.`,
				});
			}
		}

		return res.status(200).json({
			error: false,
			message: `Thêm thành công.\n
					Đã tạo bưu cục có mã bưu chính: ${req.body.postal_code} và mã nhân viên ${resultCreatingAgencyId.agency_id}.\n
					Đã tạo nhân viên có mã nhân viên ${resultCreatingAgencyId.agency_id} trong cơ sở dữ liệu tổng.
					Đã tạo nhân viên có mã nhân viên ${resultCreatingAgencyId.agency_id} trong cơ sở dữ liệu bưu cục.`,
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
		const { error } = agencyValidation.validateFindingAgencyByAgencyId(req.query) || agencyValidation.validateUpdatingAgency(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
			});
		}
		
		const result = await agenciesService.updateAgency(req.body, req.query);
		
		if (result[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bưu cục không tồn tại.",
			});
		}

		return res.status(200).json({
			error: false,
			message: "Cập nhật thành công.",
		});

	} catch (error) {
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

		const deletorId = req.user.staff_id;
		const action = agencyValidation.isAllowedToDelete(deletorId, req.body);

		if (!action.allowed) {
			return res.status(400).json({
				error: true,
				message: action.message,
			});
		}

		const resultDeletingAgency = await agenciesService.deleteAgency(req.query);

		if (resultDeletingAgency[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Bưu cục ${req.query.agency_id} không tồn tại.`,
			});
		}

		const resultDeletingStaff = await staffsService.deleteStaff(req.query);

		if (resultDeletingStaff[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: `Nhân viên ${req.query.agency_id} không tồn tại.`
			});
		}

		const agencyId = req.query.agency_id;
		const agencyIdSubParts = agencyId.split('_');
		const postalCode = agencyIdSubParts[2];

		const resultDroppingTableForAgency = await agenciesService.dropTableForAgency(postalCode);

		if (!resultDroppingTableForAgency.success) {
			throw new Error(resultDroppingTableForAgency.message);
		}

		if (agencyIdSubParts[1] === "AD") {
			const result = await agenciesService.locateAgencyInArea(1, postalCode.slice(0, 2), agencyId);

			if (!result || result[0].affectedRows <= 0) {
				return res.status(404).json({
					error: true,
					message: `Tỉnh/thành phố có mã bưu chính bắt đầu với ${req.body.postal_code.slice(0, 2)} không tồn tại.`,
				});
			}
		}

		return res.status(200).json({
			error: false,
			message: `Xóa bưu cục ${req.query.agency_id} thành công.\n
					${resultDroppingTableForAgency.message}`,
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
};