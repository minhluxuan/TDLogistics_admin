const transportPartnerService = require("../services/transportPartnerService");
const validation = require("../lib/validation");
const staffsService = require("../services/staffsService");
const transportPartnerValidation = new validation.TransportPartnerValidation();

const getTransportPartner = async (req, res) => {
    try {
        const { error } = transportPartnerValidation.validateFindingPartner(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const result = await transportPartnerService.getManyPartners(req.body);
        if (!result) {
            throw new Error("Đã xảy ra lỗi. Lấy thông tin đối tác vận chuyển không thành công. Vui lòng thử lại.");
        }
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
};

const createNewTransportPartner = async (req, res) => {
    try {
        const { error } = transportPartnerValidation.validateCreatingPartner(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
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

        const personnel_id = req.user.staff_id || req.user.agency_id;
        const prefix = personnel_id.split("_").slice(0, 2).join("_");
        const transportPartnerId = prefix + "_" + req.body.user_cccd;
        const info = {
            bin: req.body.bin,
            bank: req.body.bank,
            tax_code: req.body.tax_code,
            transport_partner_name: req.body.transport_partner_name,
            province: req.body.province,
            district: req.body.district,
            town: req.body.town,
            detail_address: req.body.detail_address,
            phone_number: req.body.phone_number,
            email: req.body.email,
            transport_partner_id: transportPartnerId,
        };

        req.body.user_password = utils.hash(req.body.user_password);

        const newStaff = new Object({
            transport_partner_id: transportPartnerId,
            staff_id: transportPartnerId,
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
        if (!resultCreatingNewStaff || resultCreatingNewStaff.affectedRows <= 0) {
            textResultCreatingNewStaff = `
			Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thất bại.\n
			Vui lòng tạo thủ công tài khoản nhân viên quản lý bưu cục với mã nhân viên ${agencyId} và thông tin đã cung cấp trước đó.`;
        } else {
            textResultCreatingNewStaff = `Tạo tài khoản nhân viên quản lý bưu cục có mã nhân viên ${agencyId} trong cơ sở dữ liệu tổng thành công.`;
        }

        const existed = await transportPartnerService.checkExistPartner(info);

        if (existed) {
            return res.status(400).json({
                error: true,
                message: "Đối tác vận chuyển đã tồn tại.",
            });
        }
        const result = await transportPartnerService.createNewPartner(info, personnel_id);
        let textResultCreatingNewTransportPartner;
        if (!result || result.affectedRows <= 0) {
            textResultCreatingNewTransportPartner = `Tạo Transportparner ${transportPartnerId} thất bại`;
        } else {
            textResultCreatingNewTransportPartner = `Tạo Transportparner ${transportPartnerId} thành công`;
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
        console.log(result);
        return res.status(200).json({
            error: false,
            message: `
			Kết quả:\n
			${textResultCreatingNewStaff}\n
			${textResultCreatingNewTransportPartner}\n`,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};
const updateTransportPartner = async (req, res) => {
    try {
        const { error } =
            transportPartnerValidation.validateFindingPartner(req.query) ||
            transportPartnerValidation.validateUpdatePartner(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const result = await transportPartnerService.updatePartner(req.body, req.query);

        if (result[0].affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: "Đối tác vận chuyển không tồn tại.",
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
};

const deleteTransportPartner = async (req, res) => {
    try {
        const { error } = transportPartnerValidation.validateDeletingPartner(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }
        const result = await transportPartnerService.deletePartner(req.query);

        if (result[0].affectedRows <= 0) {
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
    deleteTransportPartner,
};
