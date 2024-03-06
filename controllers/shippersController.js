const moment = require("moment");
const shippersService = require("../services/shippersService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");

const shippersValidation = new validation.ShippersValidation();

const getTasks = async (req, res) => {
    try {
        const { error } = shippersValidation.validateFindingTasks(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }

        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);

        req.body.staff_id = req.user.staff_id;
        const resultGettingTasks = await shippersService.getTasks(req.body, postalCode);
        
        return res.status(200).json({
            error: false,
            data: resultGettingTasks,
            message: `Lấy công việc của bưu tá có mã ${req.user.staff_id} thành công.`,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const confirmCompletedTask = async (req, res) => {
    try {
        const completedTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const { error } = shippersValidation.validateConfirmingCompletedTasks(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);
        const resultConfirmingCompletedTask = await shippersService.confirmCompletedTask(req.body.id, req.user.staff_id, completedTime, postalCode);
        if (!resultConfirmingCompletedTask || resultConfirmingCompletedTask.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: "Công việc đã hoàn thành trước đó hoặc không tồn tại.",
            });
        }

        return res.status(201).json({
            error: false,
            message: "Xác nhận hoàn thành công việc thành công.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getHistory = async (req, res) => {
    try {
        const { error } = shippersValidation.validateGettingHistory(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        req.body.staff_id = req.user.staff_id;
        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);
        const resultGettingHistory = await shippersService.getHistory(req.body, postalCode);

        return res.status(200).json({
            error: false,
            data: resultGettingHistory,
            message: `Lấy lịch sử công việc của bưu tá có mã ${req.user.staff_id} thành công.`,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

module.exports = {
    getTasks,
    confirmCompletedTask,
    getHistory,
}