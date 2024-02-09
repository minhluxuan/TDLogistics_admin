const transportPartnerService = require("../services/transportPartnerService");
const validation = require("../lib/validation");

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

        const existed = await transportPartnerService.checkExistPartner(req.body);

        if (existed) {
            return res.status(400).json({
                error: true,
                message: "Đối tác vận chuyển đã tồn tại.",
            });
        }

        const personnel_id = req.user.staff_id || req.user.agency_id;
        const info = {
            username: req.body.username,
            user_password: req.body.user_password,
            user_fullname: req.body.user_fullname,
            user_phone_number: req.body.user_phone_number,
            user_email: req.body.user_email,
            user_date_of_birth: req.body.user_date_of_birth,
            user_cccd: req.body.user_cccd,
            user_province: req.body.user_province,
            user_district: req.body.user_district,
            user_town: req.body.user_town,
            user_detail_address: req.body.user_detail_address,
            user_position: req.body.user_position,
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
        };
        const result = await transportPartnerService.createNewPartner(info, personnel_id);
        console.log(result);
        return res.status(200).json({
            error: false,
            message: "Thêm thành công!",
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
