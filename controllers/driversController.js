const moment = require("moment");
const driversService = require("../services/driversService");
const vehicleService = require("../services/vehicleService");
const shipmentService = require("../services/shipmentsService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");

const driversValidation = new validation.DriversValidation();

const getObjectsCanHandleTask = async (req, res) => {
    try {
        let resultGettingObjectsCanHandleTask = null;
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
            resultGettingObjectsCanHandleTask = await driversService.getObjectsCanHandleTaskByAdmin();
        }
        else {
            resultGettingObjectsCanHandleTask = await driversService.getObjectsCanHandleTaskByAgency(req.user.agency_id);
        }

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

        const vehicleIdSubParts = req.body.vehicle_id.split('_');
        if (vehicleIdSubParts[0] !== "TD") {
            return res.status(409).json({
                error: true,
                message: `Phương tiện ${req.body.vehicle_id} không thuộc quyền quản lý của tổng công ty.`,
            });
        }

        const staff_id = resultGettingOneVehicle[0].staff_id;
        if (!staff_id) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã ${req.body.vehicle_id} không được sở hữu bởi bất kỳ nhân viên nào.`,
            });
        }
        
        const shipmentsInfo = new Array();
        for (const shipment_id of req.body.shipment_ids) {
            const resultGettingOneShipment = await shipmentService.getOneShipment({ shipment_id });
            if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Lô hàng có mã ${shipment_id} không tồn tại.`,
                });
            }

            if (resultGettingOneShipment[0].status > 3) {
                return res.status(409).json({
                    error: true,
                    message: `Lô hàng có mã ${shipment_id} không còn khả thi để phân việc.`,
                });
            }

            shipmentsInfo.push({ shipment_id: shipment_id, agency_id: resultGettingOneShipment[0].agency_id });
        }

        for (const shipment of shipmentsInfo) {
            await shipmentService.updateShipment({ transport_partner_id: resultGettingOneVehicle[0].transport_partner_id, status: 3 }, { shipment_id: shipment.shipment_id });
            await shipmentService.updateShipment({ transport_partner_id: resultGettingOneVehicle[0].transport_partner_id, status: 3 }, { shipment_id: shipment.shipment_id }, utils.getPostalCodeFromAgencyID(req.user.agency_id));
            await shipmentService.updateShipment({ transport_partner_id: resultGettingOneVehicle[0].transport_partner_id, status: 3 }, { shipment_id: shipment.shipment_id }, utils.getPostalCodeFromAgencyID(shipment.agency_id));
        }

        const resultAddingShipmentsToVehicle = await vehicleService.addShipmentToVehicle(resultGettingOneVehicle[0], req.body.shipment_ids);

        let resultCreatingNewTask = null;
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
            resultCreatingNewTask = await driversService.assignNewTasks(resultAddingShipmentsToVehicle.acceptedArray, staff_id, resultGettingOneVehicle[0].vehicle_id);
        }
        else {
            resultCreatingNewTask = await driversService.assignNewTasks(resultAddingShipmentsToVehicle.acceptedArray, staff_id, resultGettingOneVehicle[0].vehicle_id, utils.getPostalCodeFromAgencyID(req.user.agency_id));
        }
        
        if (!resultCreatingNewTask) {
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }

        resultCreatingNewTask.notAcceptedNumber += resultAddingShipmentsToVehicle.notAcceptedNumber;
        resultCreatingNewTask.notAcceptedArray = [...resultAddingShipmentsToVehicle.notAcceptedArray, ...resultCreatingNewTask.notAcceptedArray];
        
        const acceptedShipmentsInfo = new Array();
        for (const shipment of shipmentsInfo) {
            if (resultAddingShipmentsToVehicle.acceptedArray.includes(shipment.shipment_id)) {
                acceptedShipmentsInfo.push(shipment);
            }
        }

        for (const shipment of acceptedShipmentsInfo) {
            const journeyMessage = `${formattedTime}: Lô hàng được giao cho nhân viên ${staff_id} ` + resultGettingOneVehicle[0].transport_partner_id ? `thuộc đối tác ${resultGettingOneVehicle[0].transport_partner_id} ` : "" + `trên xe có biển ${resultGettingOneVehicle[0].license_plate}.`;
            await shipmentService.updateJourney(shipment.shipment_id, formattedTime, journeyMessage);
            await shipmentService.updateJourney(shipment.shipment_id, formattedTime, journeyMessage, utils.getPostalCodeFromAgencyID(req.user.agency_id));
            await shipmentService.updateJourney(shipment.shipment_id, formattedTime, journeyMessage, utils.getPostalCodeFromAgencyID(shipment.agency_id));
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

        let resultGettingTasks = new Array();
        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
            resultGettingTasks = await driversService.getTasks(req.body);
        }
        else if (["AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
            resultGettingTasks = await driversService.getTasks(req.body, postalCode);
        }
        else {
            const staffIdSubParts = req.user.staff_id.split('_');
            if (staffIdSubParts[0] === "TD") {
                resultGettingTasks = await driversService.getTasks(req.body);
            }
            else {
                resultGettingTasks = await driversService.getTasks(req.body, staffIdSubParts[1]);
            }
        }
        
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

        let resultConfirmingCompletedTask = null;
        const staffIdSubParts = req.user.staff_id.split('_');
        if (staffIdSubParts[0] === "TD") {
            resultConfirmingCompletedTask = await driversService.confirmCompletedTask(req.query);
        }
        else {
            resultConfirmingCompletedTask = await driversService.confirmCompletedTask(req.query, staffIdSubParts[1]);
        }
        
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

const deleteTask = async (req, res) => {
    try {
        const { error } = driversValidation.validateConfirmingCompletedTasks(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["ADMIN", "MANAGER", "HUMAN_RESOURCE_MANAGER"].includes(req.user.role)) {
            const resultDeletingTask = await driversService.deleteTask(req.body.id);
            if (!resultDeletingTask || resultDeletingTask.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Công việc có id = ${req.body.id} không tồn tại.`,
                });
            }
        }

        else {
            const postalCode = utils.getPostalCodeFromAgencyID(req.user.agency_id);
            const resultDeletingTask = await driversService.deleteTask(req.body.id, postalCode);
            if (!resultDeletingTask || resultDeletingTask.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Công việc có id = ${req.body.id} không tồn tại.`,
                });
            }
        }

        return res.status(200).json({
            error: false,
            message: `Xoá công việc có id = ${req.body.id} thành công.`,
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
    deleteTask,
}