const agenciesService = require ("../services/agenciesService");
const utils = require("../utils");
const controllerUtils = require("./utils");

const AgencyValidation = new controllerUtils.AgencyValidation();

const verifyAgencySuccess = (req, res) => {
	return res.status(200).json({
		error: false,
		valid: true,
		message: "Xác thực thành công."
	});
}

const verifyAgencyFail = (req, res) => {
	return res.status(404).json({
		error: true,
		valid: false,
		message: "Xác thực thất bại. Vui lòng đăng nhập hoặc đăng ký.",
	});
}

const checkExistAgency = async (req, res) => {
	const { error } = AgencyValidation.validateCheckingExistAgency(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
		const existed = await agenciesService.checkExistAgency(Object.keys(req.body), Object.values(req.body));
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
	// if (!req.isAuthenticated() || req.user.permission < 2) {
	// 	return res.status(401).json({
	// 		error: true,
	// 		message: "Bạn không được phép truy cập tài nguyên này.",
	// 	});
	// }
	
	// const permission = req.user.permission;
	const permission = 4;
	if (permission == 3) {
		try {
			const { error } = AgencyValidation.validateFindingByAgency(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: "Mã nhân viên không hợp lệ.",
				});
			}

			// if (req.user.agency_id !== req.body.agency_id) {
			// 	return res.status(401).json({
			// 		error: true,
			// 		message: "Bạn không được phép truy cập tài nguyên này.",
			// 	});
			// }

			const keys = Object.keys(req.body);
			const values = Object.values(req.body);

			const result = await agenciesService.getOneAgency(keys, values); 
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

	if (permission === 4) {
		const { error } = AgencyValidation.validateFindingAgencyByAdmin(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		try {
			const result = await agenciesService.getManyAgencies(keys, values);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		} catch (error) {
			res.status(500).json({
				error: true,
				message: error.message,
			});
		}
	}
}

const createNewAgency = async (req, res) => {
	// if (!req.isAuthenticated() || req.user.permission < 4) {
	// 	return res.status(401).json({
	// 		error: true,
	// 		message: "Bạn không được phép truy cập tài nguyên này.",
	// 	});
	// }
	try {

		const { error } = AgencyValidation.validateCreatingAgency(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: error.message,
				//message: "Thông tin không hợp lệ.",
			});
		}

		const isExist = await agenciesService.checkExistAgency(["email"], [req.body.email]);

		if (isExist) {
			return res.status(400).json({
				error: true,
				message: "Bưu cục đã tồn tại.",
			});
		}

		const data = await agenciesService.generateAgencyID(req.body.level, req.body.province, req.body.district);

		req.body.password = utils.hash(req.body.password);

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		keys.push("agency_id");
		values.push(data.agency_id);

		const result = await agenciesService.createNewAgency(keys, values);

		await agenciesService.createTableForAgency(data.postal_code);
		await agenciesService.locateAgencyInArea(1, data.agency_id);

		return res.status(200).json({
			error: false,
			data: result,
			message: "Thêm thành công!",
		});
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

const updateAgency = async (req, res) => {
	// if (!req.isAuthenticated() || req.user.permission < 4) {
	// 	return res.status(401).json({
	// 		error: true,
	// 		message: "Bạn không được phép truy cập tài nguyên này.",
	// 	});
	// }

	try {
		const { error } = AgencyValidation.validateUpdatingAgency(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		if ("password" in req.body) {
			req.body.password = utils.hash(req.body.password);
		}

		const keys = Object.keys(req.body);
		const values = Object.values(req.body);

		const conditionFields = ["agency_id"];
		const conditionValues = [req.body.agency_id];

		
		const result = await agenciesService.updateAgency(keys, values, conditionFields, conditionValues);
		if (result[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bưu cục không tồn tại."
			});
		}

		return res.status(200).json({
			error: false,
			data: result,
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
	// if (!req.isAuthenticated() || req.user.permission < 3) {
	// 	return res.status(401).json({
	// 		error: true,
	// 		message: "Bạn không có quyền truy cập tài nguyên này!",
	// 	});
	// }

	try {
		const { error } = AgencyValidation.validateDeletingAgency(req.body);
		
		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const result = await agenciesService.deleteAgency(Object.keys(req.body), Object.values(req.body));
		if (result[0].affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bưu cục không tồn tại.",
			});
		}
		let agencyID = req.body.agency_id;
		agencyID = agencyID.split('_');
		const postalCode = agencyID[2];

		await agenciesService.dropTableForAgency(postalCode);
		await agenciesService.locateAgencyInArea(0, req.body.agency_id);

		return res.status(200).json({
			error: false,
			message: `Xóa bưu cục ${req.body.agency_id} thành công.`,
		});

	} catch (error) {
		return res.status(500).json({
			error: true,
			message: error.message,
		});
	}
}

module.exports = {
    verifyAgencyFail,
    verifyAgencySuccess,
	checkExistAgency,
	getAgencies,
	createNewAgency,
	updateAgency,
	deleteAgency,
};