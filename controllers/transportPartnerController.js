const fs = require("fs");
const path = require("path");
const transportPartnerService = require("../services/transportPartnerService");
const agenciesService = require("../services/agenciesService");
const partnerStaffsService = require("../services/partnerStaffsService");
const validation = require("../lib/validation");
const utils = require("../lib/utils");

const transportPartnerValidation = new validation.TransportPartnerValidation();

const getTransportPartner = async (req, res) => {
    try {
        if (["TRANSPORT_PARTNER_REPRESENTOR"].includes(req.user.role)) {
            const { error } = transportPartnerValidation.validateFindingPartnerByPartner(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const result = await transportPartnerService.getOnePartner(req.body);

            return res.status(200).json({
                error: true,
                data: result,
                message: "Lấy thông tin thành công.",
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER"].includes(req.user.role)) {
            
            const paginationConditions = { rows: 0, page: 0 };

			if (req.query.rows) {
				paginationConditions.rows = parseInt(req.query.rows);
			}

			if (req.query.page) {
				paginationConditions.page = parseInt(req.query.page);
			}

			const { error: paginationError } = transportPartnerValidation.validatePaginationConditions(paginationConditions);
			if (paginationError) {
				return res.status(400).json({
					error: true,
					message: paginationError.message,
				});
			}
            
            const { error } = transportPartnerValidation.validateFindingPartnerByAdmin(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            req.query.agency_id = req.user.agency_id;

            const result = await transportPartnerService.getManyPartners(req.body, paginationConditions);

            return res.status(200).json({
                error: true,
                data: result,
                message: "Lấy thông tin thành công.",
            });
        }

        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINT_SOLVER"].includes(req.user.role)) {
            const paginationConditions = { rows: 0, page: 0 };

			if (req.query.rows) {
				paginationConditions.rows = parseInt(req.query.rows);
			}

			if (req.query.page) {
				paginationConditions.page = parseInt(req.query.page);
			}

			const { error: paginationError } = transportPartnerValidation.validatePaginationConditions(paginationConditions);
			if (paginationError) {
				return res.status(400).json({
					error: true,
					message: paginationError.message,
				});
			}

            const { error } = transportPartnerValidation.validateFindingPartnerByAdmin(req.body);

            if (error) {
                return res.status(400).json({
                    error: true,
                    message: error.message,
                });
            }

            const result = await transportPartnerService.getManyPartners(req.body, paginationConditions);

            return res.status(200).json({
                error: true,
                data: result,
                message: "Lấy thông tin thành công.",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: error,
        });
    }
};

const createNewTransportPartner = async (req, res) => {
    try {
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const { error } = transportPartnerValidation.validateCreatingPartnerByAdmin(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			if (!(await agenciesService.checkExistAgency({ agency_id: req.body.agency_id }))) {
				return res.status(404).json({
					error: true,
					message: `Bưu cục có mã bưu cục ${req.body.agency_id} không tồn tại.`,
				});
			}
		}
		else if (["AGENCY_MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
			const { error } = transportPartnerValidation.validateCreatingPartnerByAgency(req.body);

			if (error) {
				return res.status(400).json({
					error: true,
					message: error.message,
				});
			}

			req.body.agency_id = req.user.agency_id;
		}

        const tempUser = new Object({
            username: req.body.username,
            cccd: req.body.user_cccd,
            phone_number: req.body.user_phone_number,
            email: req.body.user_phone_number,
        });

        const resultCheckingExistStaff = await partnerStaffsService.checkExistPartnerStaff(tempUser);
        if (resultCheckingExistStaff.existed) {
            return res.status(409).json({
                error: true,
                message: resultCheckingExistStaff.message,
            });
        }

        const creatorIdSubParts = req.user.staff_id.split('_');
        const transportPartnerId = creatorIdSubParts[0] + '_' + creatorIdSubParts[1] + '_' + req.body.user_cccd;
        
        const newTransportPartner = {
            transport_partner_id: transportPartnerId,
            agency_id: req.body.agency_id,
            tax_code: req.body.tax_code || null,
            transport_partner_name: req.body.transport_partner_name,
            province: req.body.province,
            district: req.body.district,
            town: req.body.town,
            detail_address: req.body.detail_address,
            phone_number: req.body.phone_number,
            email: req.body.email,
            bin: req.body.bin,
            bank: req.body.bank,
            contract: req.file ? req.file.filename : null,
        };

        req.body.user_password = utils.hash(req.body.user_password);

        const newStaff = new Object({
            agency_id: req.body.agency_id,
            partner_id: transportPartnerId,
            staff_id: transportPartnerId,
            username: req.body.username,
            password: req.body.user_password,
            fullname: req.body.user_fullname,
            phone_number: req.body.user_phone_number || null,
            email: req.body.user_email || null,
            date_of_birth: req.body.user_date_of_birth || null,
            cccd: req.body.user_cccd,
            province: req.body.user_province || null,
            district: req.body.user_district || null,
            town: req.body.town || null,
            detail_address: req.body.user_detail_address || null,
            role: "TRANSPORT_PARTNER_REPRESENTOR",
            position: req.body.user_position || null,
            bin: req.body.user_bin || null,
            bank: req.body.user_bank || null,
            active: false,
        });

        const resultCreatingNewPartner = await transportPartnerService.createNewPartner(newTransportPartner);

        let textResultCreatingNewTransportPartner;
        if (!resultCreatingNewPartner || resultCreatingNewPartner.affectedRows <= 0) {
            textResultCreatingNewTransportPartner = `Tạo đối tác vận tải có mã đối tác ${transportPartnerId} thất bại`;
        } else {
            textResultCreatingNewTransportPartner = `Tạo đối tác vận tải có mã đối tác ${transportPartnerId} thành công`;
        }

        const resultCreatingNewPartnerStaff = await partnerStaffsService.createNewPartnerStaff(newStaff);

        let textResultCreatingNewPartnerStaff;
        if (!resultCreatingNewPartnerStaff || resultCreatingNewPartnerStaff.affectedRows <= 0) {
            textResultCreatingNewPartnerStaff = `Tạo tài khoản nhân viên quản lý đối tác vận tải có mã nhân viên ${transportPartnerId} thất bại.`;
        } else {
            textResultCreatingNewPartnerStaff = `Tạo tài khoản nhân viên quản lý đối tác vận tải có mã nhân viên ${transportPartnerId} thành công.`;
        }

        if (req.file) {
            const tempFolderPath = path.join("storage", "transport_partner", "document", "contract_temp");
            if (!fs.existsSync(tempFolderPath)) {
                fs.mkdirSync(tempFolderPath, { recursive: true });
            }

            const officialFolderPath = path.join("storage", "transport_partner", "document", "contract");
            if (!fs.existsSync(officialFolderPath)) {
                fs.mkdirSync(officialFolderPath, { recursive: true });
            }

            const tempFilePath = path.join(tempFolderPath, req.file.filename);
            const officialFilePath = path.join(officialFolderPath, req.file.filename);

            fs.renameSync(tempFilePath, officialFilePath);
        }

        return res.status(201).json({
            error: false,
            message: `
			Kết quả:\n
			${textResultCreatingNewTransportPartner}\n
            ${textResultCreatingNewPartnerStaff}\n`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const updateTransportPartner = async (req, res) => {
    try {
        const { error } =
            transportPartnerValidation.validateFindingPartnerByPartner(req.query) ||
            transportPartnerValidation.validateUpdatePartner(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const updatorIdSubParts = req.user.staff_id.split('_');
		const partnerIdSubParts = req.query.transport_partner_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"] && 
            (updatorIdSubParts[0] !== partnerIdSubParts[0] || updatorIdSubParts[1] !== partnerIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Đối tác vận tải có mã đối tác ${req.query.transport_partner_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

        const resultGettingOneTransportPartner = await transportPartnerService.getOnePartner(req.query);

        if (!resultGettingOneTransportPartner || resultGettingOneTransportPartner.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Đối tác vận tải có mã đối tác ${req.query.transport_partner_id} không tồn tại.`,
            });
        }

        const partner = resultGettingOneTransportPartner[0];

        if (req.body.hasOwnProperty("debit")) {
            req.body.debit += partner.debit || 0;
        }

        const resultUpdatingTransportPartner = await transportPartnerService.updatePartner(req.body, req.query);

        if (!resultUpdatingTransportPartner || resultUpdatingTransportPartner.affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: `Đối tác vận tải có mã đối tác ${req.query.transport_partner_id} không tồn tại.`,
            });
        }

        return res.status(201).json({
            error: false,
            message: `Cập nhật thông tin đối tác vận tải có mã đối tác ${req.query.transport_partner_id} thành công.`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const updateContract = async (req, res) => {
    try {
        const { error } = transportPartnerValidation.validateFindingPartnerByPartner(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const updatorIdSubParts = req.user.staff_id.split('_');
        const partnerIdSubParts = req.query.transport_partner_id.split('_');

        if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"] && 
            (updatorIdSubParts[0] !== partnerIdSubParts[0] || updatorIdSubParts[1] !== partnerIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Đối tác vận tải có mã đối tác ${req.query.transport_partner_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

        const resultGettingOneTransportPartner = await transportPartnerService.getOnePartner(req.query);

        if (!resultGettingOneTransportPartner || resultGettingOneTransportPartner <= 0) {
            return res.status(404).json({
                error: true,
                message: `Đối tác vận tải có mã đối tác ${req.query.transport_partner_id} không tồn tại.`,
            });
        }

        const partner = resultGettingOneTransportPartner[0];
        const contract = partner.contract;

        const resultUpdatingTransportPartner = await transportPartnerService.updatePartner({ contract: req.file.filename }, req.query);
        if (!resultUpdatingTransportPartner || resultUpdatingTransportPartner.affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: `Đối tác vận tải có mã đối tác ${req.query.transport_partner_id} không tồn tại.`
            });
        }

        const tempFolderPath = path.join("storage", "transport_partner", "document", "contract_temp");
        if (!fs.existsSync(tempFolderPath)) {
            fs.mkdirSync(tempFolderPath, { recursive: true });
        }

        const officialFolderPath = path.join("storage", "transport_partner", "document", "contract");
        if (!fs.existsSync(officialFolderPath)) {
            fs.mkdirSync(officialFolderPath, { recursive: true });
        }

        const tempFilePath = path.join(tempFolderPath, req.file.filename);
        const officialFilePath = path.join(officialFolderPath, req.file.filename);

        if (contract) {
            const oldFilePath = path.join(officialFolderPath, contract);

            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        fs.renameSync(tempFilePath, officialFilePath);

        return res.status(201).json({
            error: true,
            message: "Cập nhật thành công.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
} 

const deleteTransportPartner = async (req, res) => {
    try {
        const { error } = transportPartnerValidation.validateDeletingPartner(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const deletorIdSubParts = req.user.staff_id.split('_');
		const partnerIdSubParts = req.query.transport_partner_id.split('_');

		if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"] && 
            (deletorIdSubParts[0] !== partnerIdSubParts[0] || deletorIdSubParts[1] !== partnerIdSubParts[1])) {
			return res.status(404).json({
				error: true,
				message: `Đối tác vận tải có mã đối tác ${req.query.transport_partner_id} không tồn tại hoặc không thuộc quyền kiểm soát của bạn.`,
			});
		}

        const resultDeletingPartner = await transportPartnerService.deletePartner(req.query);

        if (!resultDeletingPartner || resultDeletingPartner.affectedRows <= 0) {
            return res.status(200).json({
                error: true,
                message: "Đối tác vận chuyển không tồn tại.",
            });
        }

        return res.status(200).json({
            error: false,
            message: `Xóa đối tác vận chuyển ${req.query.transport_partner_id} thành công.`,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Đã xảy ra lỗi. Vui lòng thử lại.",
        });
    }
};

module.exports = {
    createNewTransportPartner,
    getTransportPartner,
    updateTransportPartner,
    updateContract,
    deleteTransportPartner,
};
