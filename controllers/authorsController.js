const authorService = require ("../service/authorService");
const utils = require("./utils");

const createNewStaff = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission < 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	const userRequestValidation = new utils.AuthorUserRequestValidation();

	const { error } = userRequestValidation.validateCreatingStaff(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	const checkExistStaff = await authorService.checkExistStaff( ["cccd"] , [req.body.cccd ]);

	if (checkExistStaff.affectedRows > 0) {
		return res.status(400).json({
			error: true,
			message: "Nhân viên đã tồn tại.",
		});
	}

	const keys = req.body.keys();
	const values = req.body.values();

	try {
		await authorService.createNewStaff(keys, values);
		return res.status(200).json({
			error: false,
			message: "Thêm thành công!",
		});
	} catch (error) {
		return res.status(500).json({
			error: true,
			message: error,
		});
	}
};

const getStaffs = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission < 2) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	if (req.user.permission == 2) {
		const authorUserRequestValidation = new utils.AuthorUserRequestValidation();
		const { error } = authorUserRequestValidation.validateFindingStaffByStaff(req.query);

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

		const keys = req.query.keys();
		const values = req.query.values();

		try {
			const result = await authorService.getOneStaff(keys, values); 
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		} catch (error) {
			return res.status(500).json({
				error: true,
				message: error,
			});
		}
	}

	if (req.user.permission === 3) {
		const authorUserRequestValidation = new utils.AuthorUserRequestValidation();
		const { error } = authorUserRequestValidation.validateFindingStaffByAdmin(req.body);

		if (error) {
			return res.status(400).json({
				error: true,
				message: "Thông tin không hợp lệ.",
			});
		}

		const keys = req.body.keys();
		const values = req.body.values();

		keys.push("agency_id");
		values.push(req.user.agency_id);

		try {
			const result = await authorService.getManyStaffs(keys, values);
			return res.status(200).json({
				error: false,
				data: result,
				message: "Lấy thông tin thành công.",
			});
		} catch (error) {
			console.error("Error: ", error);
			res.status(500).json({
				error: true,
				message: error,
			});
		}
	}
};

const updateStaffInfo = async (req, res) => {
	if (!req.isAuthenticated() || req.user.permission < 3) {
		return res.status(401).json({
			error: true,
			message: "Bạn không được phép truy cập tài nguyên này.",
		});
	}

	const staffId = req.query.staff_id;
	const agencyId = req.user.agency_id;

	const authorUserRequestValidation = new utils.AuthorUserRequestValidation();
	const { error } = authorUserRequestValidation.validateFindingStaffByStaff(req.query) && authorUserRequestValidation.validateUpdatingStaff(req.body);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	if (req.body.hasOwnProperty("paid_salary")) {
		const staff = await authorService.getOneStaff(["staff_id"], [staffId]);
		req.body["paid_salary"] += parseInt(staff["paid_salary"]);
	}

	const keys = req.body.keys();
	const values = req.body.values();

	// Kiểm tra nhân viên được cập nhật có thuộc agency của admin 
	const conditionFields = ["staff_id", "agency_id"];
	const conditionValues = [staffId, agencyId];

	try {
		const result = await authorService.updateStaff(keys, values, conditionFields, conditionValues);

		if (result.affectedRows <= 0) {
			return res.status(404).json({
				error: true,
				message: "Bạn không có quyền cập nhật tài nguyên này."
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

	const userRequestValidation = new utils.AuthorUserRequestValidation();
	const { error } = userRequestValidation.validateDeletingStaff(req.query);

	if (error) {
		return res.status(400).json({
			error: true,
			message: "Thông tin không hợp lệ.",
		});
	}

	try {
	// kiểm tra staffId có thuộc quyền quản lý của agencyId của admin hay không
	const result = await authorService.deleteStaff(["agency_id", "staff_id"], [req.user.agency_id, req.query.staff_id]);

	if (result.affectedRows <= 0) {
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

module.exports = {
	createNewStaff,
	getStaffs,
	updateStaffInfo,
	deleteStaff
};
