const transportPartnerService = require("../services/transportPartnerService");
const controllerUtils = require("./utils");

const transportPartnerValidation = new controllerUtils.TransportPartnerValidation();

const getTransportPartner = async (req, res) => {
    //authorization

    //end of authorization

    const { error } = transportPartnerValidation.validateFindingPartner(req.query);
    try {
        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const keys = Object.keys(req.query);
        const values = Object.values(req.query);
        if (!keys || !values) {
            return res.status(500).json({
                error: false,
                message: "Null body",
            });
        }
        const result = await transportPartnerService.getManyPartners(keys, values);
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
    //authorization

    //end of authorization
    try {
        const { error } = transportPartnerValidation.validateCreatingPartner(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }

        const existed = await transportPartnerService.checkExistPartner(
            ["transport_partner_id"],
            [req.body.transport_partner_id]
        );

        if (existed) {
            return res.status(400).json({
                error: true,
                message: "Đối tác vận chuyển đã tồn tại.",
            });
        }

        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        await transportPartnerService.createNewPartner(keys, values);

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
    //authorization

    //end of authorization
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

        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        const conditionFields = Object.keys(req.query);
        const conditionValues = Object.values(req.query);

        const result = await transportPartnerService.updatePartner(keys, values, conditionFields, conditionValues);

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
    //authorization

    //end of authorization
    try {
        const { error } = transportPartnerValidation.validateDeletingPartner(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ.",
            });
        }
        const result = await transportPartnerService.deletePartner(
            ["transport_partner_id"],
            [req.query.transport_partner_id]
        );

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
