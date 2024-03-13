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
const servicesStatus = require("../lib/servicesStatus");

const OrderValidation = new Validation.OrderValidation();

try {
    eventManager.once("ioInitialize", io => {
        io.sockets.on("connection", (socket) => {            
            socket.on("notifyNewOrderFromUser", (info) => {
                try {
                    const orderTime = new Date();
                    
        
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
        const provinceSource = info.province_source.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();
        const provinceDest = info.province_dest.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();

        const mass = (info.length * info.width * info.height) / 6000;
        const map = new libMap.Map();
        const addressSoure = utils.getAddressFromComponent(info.province_source, info.district_source, info.ward_source, info.detail_source);
        const addressDest = utils.getAddressFromComponent(info.province_dest, info.district_dest, info.ward_dest, info.detail_dest);
        const distance = await map.calculateDistance(await map.convertAddressToCoordinate(addressSoure), await map.convertAddressToCoordinate(addressDest));
        
        let optionService = null;
        if(info.service_type === "T60") {
            optionService = "T60";
            info.service_type = "CPN";
        }
        info.fee = servicesFee.calculteFee(info.service_type, provinceSource, provinceDest, distance.distance, mass * 1000, 0.15, optionService, false);
        info.status_code = servicesStatus.processing.code; //Trạng thái đang được xử lí
        
        console.log(info.fee, mass, distance);
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

const calculateServiceFee = async (req, res) => {
    try{
        if((["USER", "ADMIN", "MANAGER", "TELLER", "AGENCY_MANAGER", "AGENCY_TELLER"]).includes(req.user.role)) {
            const provinceSource = req.body.province_source.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();
            const provinceDest = req.body.province_dest.replace(/^(Thành phố\s*|Tỉnh\s*)/i, '').trim();

            const mass = (req.body.length * req.body.width * req.body.height) / 6000;
            const map = new libMap.Map();
            const addressSoure = utils.getAddressFromComponent(req.body.province_source, req.body.district_source, req.body.ward_source, req.body.detail_source);
            const addressDest = utils.getAddressFromComponent(req.body.province_dest, req.body.district_dest, req.body.ward_dest, req.body.detail_dest);
            const distance = await map.calculateDistance(await map.convertAddressToCoordinate(addressSoure), await map.convertAddressToCoordinate(addressDest));
            
            let optionService = null;
            if(req.body.service_type === "T60") {
                optionService = "T60";
                req.body.service_type = "CPN";
            }
            const fee = servicesFee.calculteFee(req.body.service_type, provinceSource, provinceDest, distance.distance, mass * 1000, 0.15, optionService, false);
            return res.status(200).json({
                error: false,
                data: fee,
                message: `Phí vận chuyển là ${fee} VND.`
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        }); 
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
        const paginationConditions = { rows: 0, page: 0 };

        if (req.query.rows) {
            paginationConditions.rows = parseInt(req.query.rows);
        }

        if (req.query.page) {
            paginationConditions.page = parseInt(req.query.page);
        }

        const { error: paginationError } = OrderValidation.validatePaginationConditions(paginationConditions);
        if (paginationError) {
            return res.status(400).json({
                error: true,
                message: paginationError.message,
            });
        }

        const { error } = OrderValidation.validateFindingOrders(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (["USER", "BUSINESS"].includes(req.user.role)) {
            req.body.user_id = req.user.user_id || req.user.business_id;

            const result = await ordersService.getOrders(req.body, paginationConditions);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!"
            });
        }

        if (["AGENCY_MANAGER", "AGENCY_TELLER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_SHIPPER"].includes(req.user.role)) {
            const agencyIdSubParts = req.user.agency_id.split('_');
            
            const result = await ordersService.getOrdersOfAgency(agencyIdSubParts[1], req.body, paginationConditions);
            return res.status(200).json({
                error: false,
                data: result,
                message: "Lấy thông tin thành công!",
            });
        }

        const result = await ordersService.getOrders(req.body, paginationConditions);
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

        const orders = await ordersService.getOrdersFromFile(filePath.toString());
        
        let successNumber = 0;
        const successArray = new Array();
        let failNumber = 0;
        const failArray = new Array();
        
        for (const order of orders) {
            const orderTime = new Date();
            
            const areaAgencyIdSubParts = req.user.agency_id.split('_');
            order.agency_id = req.user.agency_id;
            order.order_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
            
            const stt = order.STT;
            delete order.STT;

            const resultCreatingNewOrder = ordersService.createNewOrder(order);
            if (!resultCreatingNewOrder || resultCreatingNewOrder.affectedRows === 0) {
                failNumber++;
                failArray.push(stt);
            }
            else {
                successNumber++;
                successArray.push(stt);
            }
        }

        fs.unlinkSync(filePath);

        return res.status(201).json({
            error: false,
            info: new Object({
                successNumber,
                successArray,
                failNumber,
                failArray,
            }),
            message: `Tạo đơn hàng từ file ${req.file.filename} thành công.`,
        });
    } catch (error) {
        console.log(error);
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

        const addressSource = utils.getAddressFromComponent(updatedRow.province_source, updatedRow.district_source, updatedRow.ward_source, updatedRow.detail_source);
        const addressDest = utils.getAddressFromComponent(updatedRow.province_dest, updatedRow.district_dest, updatedRow.ward_dest, updatedRow.detail_dest);
        const updatedFee = servicesFee.calculateExpressFee(updatedRow.service_type, addressSource, addressDest);
        
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
    createOrdersByFile,
    updateOrder,
    cancelOrder,
    calculateServiceFee
}
