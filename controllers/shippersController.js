const moment = require("moment");
const shippersService = require("../services/shippersService");
const vehicleService = require("../services/vehicleService");
const shipmentService = require("../services/shipmentsService");
const utils = require("../lib/utils");
const validation = require("../lib/validation");

const shippersValidation = new validation.ShippersValidation();

const getObjectsCanHandleTask = async (req, res) => {
    try {
        const resultGettingObjectsCanHandleTask = await shippersService.getObjectsCanHandleTask();
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
        const { error } = shippersValidation.validateCreatingNewTask(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const staffIdSubParts = req.user.staff_id.split('_');
        const vehicleIdSubParts = req.body.vehicle_id.split('_');

        if (staffIdSubParts[0] !== vehicleIdSubParts[0] || staffIdSubParts[1] !== vehicleIdSubParts[1]) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã ${req.body.vehicle_id} không tồn tại trong bưu cục có mã ${req.user.agency_id}.`,
            });
        }

        const resultGettingOneVehicle = await vehicleService.getOneVehicle({ vehicle_id: req.body.vehicle_id, agency_id: req.user.agency_id });
        if (!resultGettingOneVehicle || resultGettingOneVehicle.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã ${req.body.vehicle_id} không tồn tại trong bưu cục có mã ${req.user.agency_id}.`,
            });
        }

        const staff_id = resultGettingOneVehicle[0].staff_id;
        if (!staff_id) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã ${req.body.vehicle_id} không được sở hữu bởi bất kỳ nhân viên nào.`,
            });
        }

        const resultGettingOneShipment = await shipmentService.getOneShipment({ shipment_id: req.body.shipment_id, agency_id: req.user.agency_id });
        if (!resultGettingOneShipment || resultGettingOneShipment.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng có mã ${req.body.shipment_id} không tồn tại.`,
            });
        }

        const resultAddingShipmentsToVehicle = await vehicleService.addShipmentToVehicle(resultGettingOneVehicle[0], [req.body.shipment_id]);

        if (resultAddingShipmentsToVehicle.acceptedNumber === 0) {
            return res.status(409).json({
                error: false,
                message: `Lô hàng có mã ${req.body.shipment_id} đã tồn tại trong phương tiện có mã ${req.body.vehicle_id}.`,
            });
        }

        await shipmentService.updateShipment({ status: 3 }, { shipment_id });
        const shipmentIdSubParts = shipment_id.split('_');
        if (shipmentIdSubParts[0] === "BC" || shipmentIdSubParts[0] === "DL") {
            await shipmentService.updateShipment({ status: 3 }, { shipment_id }, shipmentIdSubParts[1]);
        }

        let orderIds;
        try {
            orderIds = resultGettingOneShipment[0].order_ids ? JSON.parse(resultGettingOneShipment[0].order_ids) : new Array();
        } catch (error) {
            orderIds = new Array();
        }

        if (!orderIds || orderIds.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Lô hàng có mã ${req.body.shipment_id} không tồn tại đơn hàng nào để có thể phân việc.`,
            });
        }

        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);
        
        const resultCreatingNewTask = await shippersService.assignNewTasks(orderIds, staff_id, postalCode);
        for(const shipment_id of resultCreatingNewTask.acceptedArray) {
            const journeyMessage = `${formattedTime}: Lô hàng được tạo mới và giao cho nhân viên ${staff_id} thuộc đối tác ${resultGettingOneVehicle[0].transport_partner_id} trên xe biển ${resultGettingOneVehicle[0].license_plate}.`;
            await shipmentService.updateJourney(shipment_id, formattedTime, journeyMessage)
        }
        
        return res.status(201).json({
            error: true,
            info: resultCreatingNewTask,
            message: `Thêm lô hàng có mã ${req.body.shipment_id} vào phương tiện có mã ${req.body.vehicle_id} và phân việc cho shipper có mã ${staff_id} thành công.`,
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
        const { error } = shippersValidation.validateFindingTasks(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }

        if (req.body.staff_id) {
            const shipperIdSubParts = req.body.staff_id.split('_');
            const staffIdSubParts = req.user.staff_id.split('_');

            if (staffIdSubParts[0] !== shipperIdSubParts[0] || staffIdSubParts[1] !== shipperIdSubParts[1]) {
                return res.status(404).json({
                    error: true,
                    message: `Nhân viên có mã ${req.body.staff_id} không thuộc quyền kiểm soát của bưu cục ${req.user.agency_id}.`,
                });
            }
        }

        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);

        if (["AGENCY_SHIPPER", "SHIPPER"].includes(req.user.role)) {
            req.body.staff_id = req.user.staff_id;
        }

        const resultGettingTasks = await shippersService.getTasks(req.body, postalCode);
        
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

        const completedTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const { error } = shippersValidation.validateConfirmingCompletedTasks(req.query);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);
        const resultConfirmingCompletedTask = await shippersService.confirmCompletedTask(req.query.id, req.user.staff_id, completedTime, postalCode);
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

        if (req.body.staff_id) {
            const shipperIdSubParts = req.body.staff_id.split('_');
            const staffIdSubParts = req.user.staff_id.split('_');

            if (staffIdSubParts[0] !== shipperIdSubParts[0] || staffIdSubParts[1] !== shipperIdSubParts[1]) {
                return res.status(404).json({
                    error: true,
                    message: `Nhân viên có mã ${req.body.staff_id} không thuộc quyền kiểm soát của bưu cục ${req.user.agency_id}.`,
                });
            }
        }

        const postalCode = utils.getPostalCodeFromAgencyID(req.user.staff_id);

        if (["AGENCY_SHIPPER", "SHIPPER"].includes(req.user.role)) {
            req.body.staff_id = req.user.staff_id;
        }
        
        const resultGettingHistory = await shippersService.getHistory(req.body, postalCode);

        return res.status(200).json({
            error: false,
            data: resultGettingHistory,
            message: `Lấy lịch sử công việc thành công.`,
        });
    } catch (error) {
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
    getHistory,
}