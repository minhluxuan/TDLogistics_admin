const moment = require("moment");
const ordersService = require("../services/ordersService");
const usersService = require("../services/usersService");
const Validation = require("../lib/validation");
const servicesFee = require("../lib/servicesFee");
const libMap = require("../lib/map");
const utils = require("../lib/utils");
const eventManager = require("../lib/eventManager");
const { object } = require("joi");
const fs = require("fs");
const path = require("path");

const OrderValidation = new Validation.OrderValidation();

try {
    eventManager.once("ioInitialize", io => {
        io.sockets.on("connection", (socket) => {
            socket.on("notifyNewOrderFromUser", (info) => {
                try {
                    const orderTime = new Date();
        
                    info.order_time = moment(orderTime).format("YYYY-MM-DD HH:mm:ss");
        
                    if (["USER"].includes(socket.request.user.role)) {
                        // const { error } = OrderValidation.validateCreatingOrder(info);
        
                        // if (error) {
                        //     return socket.emit("notifyError", error.message);
                        // }

                        info.user_id = socket.request.user.user_id;
                        info.phone_number_sender = socket.request.user.phone_number;
                        info.name_sender = socket.request.user.fullname;
                    }
                    else if (["MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"].includes(socket.request.user.role)) {
                        // const { error } = OrderValidation.validateCreatingOrderByAgency(info);
        
                        // if (error) {
                        //     return socket.emit("notifyError", error.message);
                        // }
                    }
        
                    if (info.service_type === 2 || info.service_type === 3) {
                        if(info.province_source !== info.province_dest) {
                            const errorMessage = "Đơn hàng phải được giao nội tỉnh!";
                            return socket.emit("notifyError", errorMessage);
                        }
                    }
        
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
        if (req.query.rows) {
            req.query.rows = parseInt(req.query.rows);
        }

        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
        }

        const { error1 } = OrderValidation.validatePaginationConditions(req.query);

        if (error1) {
            return res.status(400).json({
                error: true,
                message: error1.message,
            });
        }

        const { error2 } = OrderValidation.validateFindingOrders(req.body);

        if (error2) {
            return res.status(400).json({
                error: true,
                message: error1.message,
            });
        }

        if (["USER", "BUSINESS"].includes(req.user.role)) {
            req.body.user_id = req.user.user_id || req.user.business_id;

            const result = await ordersService.getOrders(req.body, req.query);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!"
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_SHIPPER"].includes(req.user.role)) {
            const agencyIdSubParts = req.user.agency_id.split('_');
            
            const result = await ordersService.getOrdersOfAgency(agencyIdSubParts[1], req.body, req.query);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!",
            });
        }

        const result = await ordersService.getOrders(req.body, req.query);
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin thành công!",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const checkFileFormat = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({
                error: true,
                message: "File không tồn tại.",
            });
        }

        const folderPath = path.join("storage", "business_user", "document", "orders_temp");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        
        const filePath = path.join(folderPath, req.file.filename);
        if (!fs.existsSync(filePath)) {
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }

        const resultCheckingFileFormat = await ordersService.checkFileFormat(filePath.toString());

        fs.unlinkSync(filePath);

        return res.status(200).json({
            error: false,
            valid: resultCheckingFileFormat.valid,
            message: resultCheckingFileFormat.message,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const createOrdersByFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({
                error: true,
                message: "File không tồn tại.",
            });
        }

        const folderPath = path.join("storage", "business_user", "document", "orders_temp");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        
        const filePath = path.join(folderPath, req.file.filename);
        if (!fs.existsSync(filePath)) {
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }

        const resultCheckingFileFormat = await ordersService.checkFileFormat(filePath.toString());
        if (!resultCheckingFileFormat.valid) {
            return res.status(400).json({
                error: true,
                message: resultCheckingFileFormat.message,
            });
        }

        const orders = ordersService.getOrdersFromFile(filePath.toString());
        let successNumber = 0;
        const successArray = new Array();
        let failNumber = 0;
        const failArray = new Array();
        for (const order of orders) {
            const areaAgencyIdSubParts = req.user.agency_id.split('_');
            order.agency_id = req.user.agency_id;
            order.order_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
            const stt = order.STT;
            
            const resultCreatingNewOrder = ordersService.createNewOrder(order);
            if (!resultCreatingNewOrder || resultCreatingNewOrder.affectedRows === 0) {
                failNumber++;
                failNumber.push(order)
            }
        }

        
    } catch (error) {
        
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
                message: error.message,
            });
        }

        if (["USER"].includes(req.user.role)) {
            req.query.user_id = req.user.user_id;

            const resultDeletingOneOrder = await ordersService.cancelOrderWithTimeConstraint(req.query);
            if (!resultDeletingOneOrder || resultDeletingOneOrder.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại hoặc quá hạn để hủy.`,
                });
            }
        }
        else if (["AGENCY_MANAGER", "AGENCY_TELLER"].includes(req.user.role)) {
            req.query.agency_id = req.user.agency_id;

            const resultDeletingOneOrder = await ordersService.cancelOrderWithTimeConstraint(req.query);
            if (!resultDeletingOneOrder || resultDeletingOneOrder.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Đơn hàng có mã đơn hàng ${req.query.order_id} không tồn tại hoặc quá hạn để huỷ.`,
                });
            }
        }
        else {
            const resultDeletingOneOrder = await ordersService.cancelOrderWithoutTimeConstraint(req.query);

            if (resultDeletingOneOrder || resultDeletingOneOrder.affectedRows === 0) {
                return res.status(404).json({
                    error: true,
                    message: `Đơn hàng ${req.query.order_id} quá hạn để hủy hoặc không tồn tại.`,
                });
            }
        }

        return res.status(200).json({
            error: false,
            message: `Hủy đơn hàng ${req.query.order_id} thành công.`,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

module.exports = {
    checkExistOrder,
    getOrders,
    checkFileFormat,
    createNewOrder,
    updateOrder,
    cancelOrder,
    // calculateFee,
}