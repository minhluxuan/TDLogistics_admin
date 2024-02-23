const moment = require("moment");
const ordersService = require("../services/ordersService");
const usersService = require("../services/usersService");
const Validation = require("../lib/validation");
const servicesFee = require("../lib/servicesFee");
const libMap = require("../lib/map");
const eventManager = require("../lib/eventManager");
const { object } = require("joi");

eventManager.once("ioInitialize", (io) => {
    // Thiết lập trình xử lý sự kiện 'connection' và 'disconnect' trong io
    io.sockets.on("connection", (socket) => {
        socket.on("notifyNewOrderFromUser", (info) => {
            try {
                const OrderValidation = new Validation.OrderValidation();
                const { error } = OrderValidation.validateCreatingOrder(info);

                if (error) {
                    console.log(error.message);
                    eventManager.emit("notifyFailCreatedNewOrder", "Thông tin đơn hàng không hợp lệ!");
                    throw new Error("Thông tin đơn hàng không hợp lệ!");
                }

                if(info.service_type === 2 || info.service_type === 3) {
                    if(info.province_source !== info.province_dest) {
                        const errorMessage = "Đơn hàng phải được giao nội tỉnh!";
                        console.log(errorMessage);
                        eventManager.emit("notifyFailCreatedNewOrder", errorMessage);
                        throw new Error(errorMessage);
                    }
                }
                info.phone_sender = socket.request.user.phone_number;
                console.log(info.phone_sender);
                createNewOrder(info);
            } catch (error) {
                return eventManager.emit("notifyError", error.message);
            }    
        });
    });
});
const OrderValidation = new Validation.OrderValidation();

const createNewOrder = async (info) => {
    try {
        const orderTime = new Date();
        
        console.log("Pass Validation");

        info.name_sender = await usersService.getNameUsingPhoneNummber(info.phone_sender);
        console.log(info.name_sender);
        const resultFindingManagedAgency = await ordersService.findingManagedAgency(info.ward_source, info.district_source, info.province_source);
        if(!resultFindingManagedAgency.sucess) {
            console.log(resultFindingManagedAgency.message);
            eventManager.emit("notifyFailCreatedNewOrder", resultFindingManagedAgency.message);
            throw new Error(resultFindingManagedAgency.message);
        }
        const addressSource = info.detail_source + ", " + info.ward_source + ", " + info.district_source + ", " + info.province_source; 
        const addressDest = info.detail_dest + ", " + info.ward_dest + ", " + info.district_dest + ", " + info.province_dest; 
        info.order_time = moment(orderTime).format("YYYY-MM-DD HH:mm:ss");
        info.journey = JSON.stringify(new Array());
        const agencies = resultFindingManagedAgency.data.agency_id;
        const areaAgencyIdSubParts = agencies.split('_');
        info.order_id = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
        info.fee = await servicesFee.calculateExpressFee(info.service_type, addressSource, addressDest);

        console.log("Pass Prepare Information")

        // const newOrder = new Object({
        //     order_id: info.order_id,
        //     name_reciever: info.name_reciever,	
        //     phone_reciever: info.phone_reciever,
        //     order_time: info.order_time,
        //     mass: info.mass,
        //     height: info.height,
        //     width: info.width,
        //     length: info.length,
        //     province_source: info.province_source,
        //     district_source: info.district_source,
        //     ward_source: info.ward_source,
        //     detail_source: info.detail_source,	
        //     long_source: info.long_source,
        //     lat_source: info.lat_source,	 	
        //     province_dest: info.province_dest,
        //     district_dest: info.district_dest,
        //     ward_dest: info.ward_dest,
        //     detail_dest:info.detail_dest,	
        //     long_destination: info.long_destination,
        //     lat_destination: info.lat_destination,
        //     fee: info.fee,
        //     COD: info.COD,
        //     journey: info.journey,
        //     service_type: info.service_type
        // });

        // console.log(newOrder);

        const resultCreatingNewOrder = await ordersService.createNewOrder(info);
        if (!resultCreatingNewOrder || resultCreatingNewOrder.length === 0) {
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }

        const resultCreatingNewOrderInAgency = await ordersService.createOrderInAgencyTable(info, resultFindingManagedAgency.data.postal_code);
        if (!resultCreatingNewOrderInAgency || resultCreatingNewOrderInAgency.length === 0) {
            throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
        }

        console.log("Pass Writing Database");

        eventManager.emit("notifySuccessCreatedNewOrder", "Tạo đơn hàng thành công.");
        
        eventManager.emit("notifyNewOrderToAgency", {
            order: info,
            room: resultFindingManagedAgency.data.agency_id,
        });
    } catch (error) {
        return eventManager.emit("notifyError", error.message);
    }
}



const getOrders = async (req, res) => {
    res.render("order");
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

const getOrderByUserID = async (req, res) => {
    try {
        const { error } = OrderValidation.validateFindingOrderByUserID(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        //const userID = req.user.user_id;
        const userID = "00000001";
        const statusCode = (req.body.status_code ? req.body.status_code : null);

        const result = await ordersService.getOrdersByUserID(userID, statusCode);
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin thành công!"
        });
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
    
}

const getOrderByOrderID = async (req, res) => {
    // if(!req.isAuthenticated() || req.user.permission !== 1) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    try {
        const { error } = OrderValidation.validateFindingOrderByOrderID(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }
        const result = await ordersService.getOrderByOrderID(req.body.order_id);
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin thành công!"
        });

        
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const calculateFee = async (req, res) => {
    // if(!req.isAuthenticated() || req.user.permission !== 1) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }

    try {
        // const { error } = OrderValidation.validateCreatingOrder(req.body);

        // if (error) {
        //     return res.status(400).json({
        //         error: true,
        //         //message: "Thông tin không hợp lệ!",
        //         message: error.message,
        //     });
        // }

        // const fee = await ordersService.calculateFee(req.body.address_source, req.body.address_dest);
        return res.status(200).json({
            error: false,
            fee: fee
        });

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}


const updateOrder = async (req, res) => {
    if (!req.isAuthenticated() || req.user.permission !== 1) {
        return res.status(401).json({
            error: true,
            message: "Bạn không được phép truy cập tài nguyên này.",
        });
    }
    
    const orderId = req.query.order_id;

    if (orderId === undefined || orderId === null || orderId === "") {
        return res.status(400).json({
            error: true,
            message: "Mã đơn hàng không tồn tại.",
        });
    }

    const { error } = OrderValidation.validateUpdatingOrder(req.body);
    
    if (error) {
        return res.status(400).json({
            error: true,
            message: "Thông tin không hợp lệ.",
        });
    }

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    const conditionFields = ["order_id", "user_id"];
    const conditionValues = [orderId, req.user.user_id];

    try {
        const result = await ordersService.updateOrder(fields, values, conditionFields, conditionValues);

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: "Đơn hàng đã quá hạn để cập nhật hoặc không tồn tại."
            });
        }

        const updatedRow = (await ordersService.getOrder({ order_id: orderId }))[0];

        const source = {
            lat: updatedRow["lat_source"],
            long: updatedRow["long_source"]
        };

        const destination = {
            lat: updatedRow["lat_destination"],
            long: updatedRow["long_destination"]
        };

        const map = new libMap.Map();

        const distance = (await map.calculateDistance(source, destination)).distance;

        const updatingFee = libMap.calculateFee(distance);

        const updatingAddressSource = await map.convertCoordinateToAddress(source);
        const updatingAddressDestination = await map.convertCoordinateToAddress(destination);

        await ordersService.updateOrder(["fee", "address_source", "address_destination"], [updatingFee, updatingAddressSource, updatingAddressDestination], ["order_id"], [orderId]);

        return res.status(200).json({
            error: false,
            message: "Cập nhật thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
};

const getOrderStatus = async (req, res) => {
    // if(!req.isAuthenticated() || req.user.permisson < 1) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    try {

        const { error } = OrderValidation.validateFindingOrderStatus(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }
        
        const result = await ordersService.getOrderStatus(req.body.order_id);
        return res.status(200).json({
            error: false,
            status_code: result.status_code,
            status_message: result.status_message
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const cancelOrder = async (req, res) => {
    if (!req.isAuthenticated() || req.user.permission !== 1) {
        return res.status(401).json({
            error: true,
            message: "Bạn không được phép truy cập tài nguyên này.",
        });
    }

    const orderId = req.query.order_id;

   //const { error } = (new Validation.OrderValidation({ order_id: orderId })).validateCancelingOrder();
    const { error } = OrderValidation.validateCancelingOrder({ order_id: orderId });

    if (error) {
        return res.status(401).json({
            error: true,
            message: "Mã đơn hàng không tồn tại.",
        });
    }

    const conditionFields = ["user_id", "order_id"];
    const conditionValues = [req.user.user_id, orderId];

    try {
        const result = await ordersService.updateOrder(["status_code"], [7], conditionFields, conditionValues);

        if (result.affectedRows <= 0) {
            return res.status(404).json({
                error: true,
                message: `Đơn hàng ${orderId} quá hạn để hủy hoặc không tồn tại.`,
            });
        }

        res.status(200).json({
            error: false,
            message: `Hủy đơn hàng ${orderId} thành công.`,
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
    getOrderByUserID,
    getOrderByOrderID,
    createNewOrder,
    updateOrder,
    cancelOrder,
    calculateFee,
    getOrderStatus,
}
