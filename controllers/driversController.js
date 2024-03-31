const moment = require("moment");
const driversService = require("../services/driversService");
const vehicleService = require("../services/vehicleService");
const shipmentService = require("../services/shipmentsService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");

const driversValidation = new validation.DriversValidation();

const createNewTask = async (req, res) => {
    try {
        const { error } = driversValidation.validateCreatingNewTask(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.body.vehicle_id });
        if (!resultGettingOneVehicle || resultGettingOneVehicle.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã ${req.body.vehicle_id} không tồn tại.`,
            });
        }

        if (!resultGettingOneVehicle[0].transport_partner_id) {
            return res.status(400).json({
                error: true,
                message: `Phương tiện phải thuộc sở hữu của một đối tác vận tải.`,
            });
        }

        const staff_id = resultGettingOneVehicle[0].staff_id;
        if (!staff_id) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã ${req.body.vehicle_id} không được sở hữu bởi bất kỳ nhân viên nào.`,
            });
        }
        
        for (const shipment_id of req.body.shipment_ids) {
            if (!(await shipmentService.checkExistShipment({ shipment_id }))) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${shipment_id} không tồn tại.`,
                });
            }
        }

        const resultCreatingNewTask = await driversService.assignNewTasks(req.body.shipment_ids, staff_id);
        
        return res.status(201).json({
            error: true,
            info: resultCreatingNewTask,
            message: `Phân việc cho tài xế có mã ${staff_id} thành công.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getTasks = async (req, res) => {
    try {
        const { error } = driversValidation.validateFindingTasks(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }

        if (["PARTNER_DRIVER"].includes(req.user.role)) {
            req.body.staff_id = req.user.staff_id;
        }

        const resultGettingTasks = await driversService.getTasks(req.body);
        
        return res.status(200).json({
            error: false,
            data: resultGettingTasks,
            message: `Lấy công việc thành công.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const confirmCompletedTask = async (req, res) => {
    try {
        const { error } = driversValidation.validateConfirmingCompletedTasks(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultConfirmingCompletedTask = await driversService.confirmCompletedTask(req.body);
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

module.exports = {
    getTasks,
    createNewTask,
    confirmCompletedTask,
}