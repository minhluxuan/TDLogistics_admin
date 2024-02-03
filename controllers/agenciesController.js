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

		const agencyId = req.body.type + '_' + req.body.postal_code + '_' + "00000";

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

		const resultCreatingNewStaff = await staffsService.createNewStaff(newStaff);
		
		let textResultCreatingNewStaff;
		if (!resultCreatingNewStaff || resultCreatingNewStaff[0].affectedRows <= 0) {
			textResultCreatingNewStaff = `
			Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thất bại.\n
			Vui lòng tạo thủ công tài khoản nhân viên quản lý bưu cục với mã nhân viên ${agencyId} và thông tin đã cung cấp trước đó.`;
		}
		else {
			textResultCreatingNewStaff = `Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thành công.`
		}

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
		if (!resultCreatingNewAgency || resultCreatingNewAgency[0].affectedRows <= 0) {
			textResultCreatingNewAgency = `
			Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thất bại.\n
			Vui lòng tạo thủ công bưu cục với mã bưu cục ${agencyId} và thông tin đã cung cấp trước đó.`;
		}
		else {
			textResultCreatingNewAgency = `Tạo bưu cục có mã bưu cục ${agencyId} trong cơ sở dữ liệu tổng thành công.`
		}

		const resultCreatingTablesForAgency = await agenciesService.createTablesForAgency(req.body.postal_code);
		const textResultCreatingTablesForAgency = resultCreatingTablesForAgency.message;

		const resultCreatingNewStaffInAgency = await staffsService.createNewStaff(newStaff, req.body.postal_code);

		let textResultCreatingNewStaffInAgency;
		if (!resultCreatingNewStaffInAgency || resultCreatingNewStaffInAgency[0].affectedRows <= 0) {
			textResultCreatingNewStaffInAgency = `
			Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu bưu cục không thành công.
			Vui lòng tạo thủ công tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong bảng ${req.body.postal_code + '_' + "staff"}.`;
		}
		else {
			textResultCreatingNewStaffInAgency = `Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu bưu cục thành công.`
		}

		const resultLocatingAgencyInArea = await agenciesService.locateAgencyInArea(0, req.body.province, req.body.district, req.body.managed_wards, agencyId, req.body.postal_code);

		const textResultLocatingAgencyInArea = resultLocatingAgencyInArea.message;

		return res.status(200).json({
			error: false,
			message: `
			Kết quả:\n
			${textResultCreatingNewStaff}\n
			${textResultCreatingNewAgency}\n
			${textResultCreatingTablesForAgency}\n
			${textResultCreatingNewStaffInAgency}\n
			${textResultLocatingAgencyInArea}.`,
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

		await agenciesService.deleteAgency(req.query);
		await staffsService.deleteStaff(req.query);

		const agencyIdSubParts = agencyId.split('_');
		const postalCode = agencyIdSubParts[1];

		const resultDroppingTableForAgency = await agenciesService.dropTableForAgency(postalCode);
		const textResultDroppingTablesForAgency = resultDroppingTableForAgency.message;
		
		const resultLocatingAgencyInArea = await agenciesService.locateAgencyInArea(1, province, district, wards, agencyId, postalCode);
		const textResultLocatingAgencyInArea = resultLocatingAgencyInArea.message;

		return res.status(200).json({
			error: false,
			message: `
			Kết quả:\n
			Xóa bưu cục có mã bưu cục ${req.query.agency_id} thành công.\n
			Xóa nhân viên quản lý bưu cục có mã nhân viên ${req.query.agency_id} thành công.\n
			
			${textResultLocatingAgencyInArea}.`,
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