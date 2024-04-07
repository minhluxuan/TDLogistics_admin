const moment = require("moment");
const driversService = require("../services/driversService");
const vehicleService = require("../services/vehicleService");
const shipmentService = require("../services/shipmentsService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");

const driversValidation = new validation.DriversValidation();

const getObjectsCanHandleTask = async (req, res) => {
    try {
        const resultGettingObjectsCanHandleTask = await driversService.getObjectsCanHandleTask();
        return res.status(200).json({
            error: false,
            data: resultGettingObjectsCanHandleTask,
            message: "Lấy các phương tiện có thể đảm nhận nhiệm vụ thành công.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const createNewTask = async (req, res) => {
    try {
        const formattedTime = moment(new Date()).format("DD-MM-YYYY HH:mm:ss");

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

            await shipmentService.updateShipment({ transport_partner_id: resultGettingOneVehicle[0].transport_partner_id, status: 3 }, { shipment_id });
            const shipmentIdSubParts = shipment_id.split('_');
            if (shipmentIdSubParts[0] === "BC" || shipmentIdSubParts[0] === "DL") {
                await shipmentService.updateShipment({ transport_partner_id: resultGettingOneVehicle[0].transport_partner_id, status: 3 }, { shipment_id }, shipmentIdSubParts[1]);
            }
        }

        const resultAddingShipmentsToVehicle = await vehicleService.addShipmentToVehicle(resultGettingOneVehicle[0], req.body.shipment_ids);

        const resultCreatingNewTask = await driversService.assignNewTasks(resultAddingShipmentsToVehicle.acceptedArray, staff_id, resultGettingOneVehicle[0].vehicle_id);
        resultCreatingNewTask.notAcceptedNumber += resultAddingShipmentsToVehicle.notAcceptedNumber;
        resultCreatingNewTask.notAcceptedArray = [...resultAddingShipmentsToVehicle.notAcceptedArray, ...resultCreatingNewTask.notAcceptedArray];
        for(const shipment_id of resultCreatingNewTask.acceptedArray) {
            const journeyMessage = `${formattedTime}: Lô hàng được tạo mới và giao cho nhân viên ${staff_id} thuộc đối tác ${resultGettingOneVehicle[0].transport_partner_id} trên xe biển ${resultGettingOneVehicle[0].license_plate}.`;
            await shipmentService.updateJourney(shipment_id, formattedTime, journeyMessage)
        }

        return res.status(201).json({
            error: false,
            info: resultCreatingNewTask,
            message: `Thêm lô hàng vào phương tiện có mã ${req.body.vehicle_id} và phân việc cho tài xế có mã ${staff_id} thành công.`,
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
        try {
            if (req.query.id) {
                req.query.id = parseInt(req.query.id);
            }
            else {
                return res.status(400).json({
                    error: true,
                    message: "Trường id là bắt buộc."
                });
            }
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: "Trường id phải là một số.",
            });
        }

        const { error } = driversValidation.validateConfirmingCompletedTasks(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultConfirmingCompletedTask = await driversService.confirmCompletedTask(req.query);
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
    getObjectsCanHandleTask,
    getTasks,
    createNewTask,
    confirmCompletedTask,
}