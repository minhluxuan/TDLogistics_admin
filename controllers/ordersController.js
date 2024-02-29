const moment = require("moment");
const ordersService = require("../services/ordersService");
const usersService = require("../services/usersService");
const Validation = require("../lib/validation");
const servicesFee = require("../lib/servicesFee");
const libMap = require("../lib/map");
const utils = require("../lib/utils");
const eventManager = require("../lib/eventManager");
const { object } = require("joi");
const servicesStatus = require("../lib/servicesStatus");

const OrderValidation = new Validation.OrderValidation();

try {
    eventManager.once("ioInitialize", io => {
        io.sockets.on("connection", (socket) => {
            socket.on("notifyNewOrderFromUser", (info) => {
                try {
                    const orderTime = new Date();
        
                    info.order_time = moment(orderTime).format("YYYY-MM-DD HH:mm:ss");
        
                    if (["USER"].includes(socket.request.user.role)) {
                        const { error } = OrderValidation.validateCreatingOrder(info);
        
                        if (error) {
                            return socket.emit("notifyError", error.message);
                        }   
                    }
                    else if (["MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"].includes(socket.request.user.role)) {
                        const { error } = OrderValidation.validateCreatingOrderByAgency(info);
        
                        if (error) {
                            return socket.emit("notifyError", error.message);
                        }
                    }
        
                    if (info.service_type === 2 || info.service_type === 3) {
                        if(info.province_source !== info.province_dest) {
                            const errorMessage = "Đơn hàng phải được giao nội tỉnh!";
                            return socket.emit("notifyError", errorMessage);
                        }
                    }
        
                    info.phone_number_sender = socket.request.user.phone_number;
                    info.name_sender = socket.request.user.fullname;
                    createNewOrder(socket, info, orderTime);
                } catch (error) {
                    return eventManager.emit("notifyError", error.message);
                }    
            });
        });
    });
} catch (error) {
    console.log(error);
    return eventManager.emit("notifyError", error.message);
}

const createNewOrder = async (socket, info, orderTime) => {
    try {
        const resultFindingManagedAgency = await ordersService.findingManagedAgency(info.ward_source, info.district_source, info.province_source);
        
        info.journey = JSON.stringify(new Array());
        const agencies = resultFindingManagedAgency.agency_id;
        const areaAgencyIdSubParts = agencies.split('_');
        info.agency_id = agencies;
        info.order_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
        const addressSource = info.detail_source + ", " + info.ward_source + ", " + info.district_source + ", " + info.province_source; 
        const addressDest = info.detail_dest + ", " + info.ward_dest + ", " + info.district_dest + ", " + info.province_dest; 
        // info.fee = await servicesFee.calculateExpressFee(info.service_type, addressSource, addressDest);
        info.status_code = servicesStatus.processing.code; //Trạng thái đang được xử lí
        
        const resultCreatingNewOrder = await ordersService.createNewOrder(info);
        if (!resultCreatingNewOrder || resultCreatingNewOrder.length === 0) {
            return socket.emit("notifyFailCreatedNewOrder", "Tạo đơn hàng thất bại.");
        }

        const resultCreatingNewOrderInAgency = await ordersService.createOrderInAgencyTable(info, resultFindingManagedAgency.postal_code);
        if (!resultCreatingNewOrderInAgency || resultCreatingNewOrderInAgency.length === 0) {
            return socket.emit("notifyFailCreatedNewOrder", "Tạo đơn hàng thất bại.");
        }

        eventManager.emit("notifySuccessCreatedNewOrder", "Tạo đơn hàng thành công.");
        
        eventManager.emit("notifyNewOrderToAgency", {
            order: info,
            room: resultFindingManagedAgency.agency_id,
        });
    } catch (error) {
        console.log(error);
        return socket.emit("notifyError", error.message);
    }
}

const checkExistOrder = async (req, res) => {
    try {
        const existed = await ordersService.checkExistOrder({ order_id: req.query.order_id });
        return res.status(200).json({
            error: false, 
            existed: existed,
            message: existed ? `Đơn hàng có mã ${req.query.order_id} đã tồn tại.` : `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getOrders = async (req, res) => {
    try {
        const { error } = OrderValidation.validateFindingOrders(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["USER"].includes(req.user.role)) {
            req.body.phone_number = req.user.phone_number;

            const result = await ordersService.getOrders(req.body);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!"
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_SHIPPER"].includes(req.user.role)) {
            const agencyIdSubParts = req.user.agency_id.split('_');
            
            const result = await ordersService.getOrdersOfAgency(agencyIdSubParts[1], req.body);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!",
            });
        }

        const result = await ordersService.getOrders(req.body);
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin thành công!",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const updateOrder = async (req, res) => {
    try {
        const { error } = OrderValidation.validateQueryUpdatingOrder(req.query) || OrderValidation.validateUpdatingOrder(req.body);
        
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }
        
        if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            req.query.agency_id = req.user.agency_id;
        }
        else if (["SHIPPER", "AGENCY_SHIPPER", "PARTNER_SHIPPER"].includes(req.user.role)) {
            req.query.shipper = req.user.staff_id;
        }
        //Update status_code = taken_success and not append new Journey
        req.body.status_code = servicesStatus.taken_success.code;
        const result = await ordersService.updateOrder(req.body, req.query);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã ${req.query.order_id} không tồn tại.`,
            });
        }
        
        const resultGettingOneOrder = await ordersService.getOneOrder(req.query);
        if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại.`,
            });
        }

        // const addressSource = utils.getAddressFromComponent(updatedRow.province_source, updatedRow.district_source, updatedRow.ward_source, updatedRow.detail_source);
        // const addressDest = utils.getAddressFromComponent(updatedRow.province_dest, updatedRow.district_dest, updatedRow.ward_dest, updatedRow.detail_dest);
        // const updatingFee = servicesFee.calculateExpressFee(updatedRow.service_type, addressSource, addressDest);
        const updatedFee = 10000;
        
        const resultUpdatingOneOrder = await ordersService.updateOrder({ fee: updatedFee }, req.query);
        if (!resultUpdatingOneOrder || resultUpdatingOneOrder.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại.`,
            });
        }
        

        return res.status(200).json({
            error: false,
            message: `Cập nhật đơn hàng có mã đơn hàng ${req.query.order_id} thành công.`,
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { error } = OrderValidation.validateCancelingOrder(req.query);

        if (error) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại.`,
            });
        }

        if (["USER"].includes(req.user.role)) {
            req.query.phone_number = req.user.phone_number;
        }
        else if (["BUSINESS".includes(req.user.role)]) {
            req.query.business_id = req.user.business_id;
        }
        else if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            req.query.agency_id = req.user.agency_id;
        }

        const resultDeletingOrder = await ordersService.cancelOrder(req.query);

        if (resultDeletingOrder || resultDeletingOrder.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng ${req.query.order_id} quá hạn để hủy hoặc không tồn tại.`,
            });
        }

        return res.status(200).json({
            error: false,
            message: `Hủy đơn hàng ${req.query.order_id} thành công.`,
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error,
        });
    }
};


module.exports = {
    checkExistOrder,
    getOrders,
    createNewOrder,
    updateOrder,
    cancelOrder,
    // calculateFee,
}