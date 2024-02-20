const moment = require("moment");
const ordersService = require("../services/ordersService");
const Validation = require("../lib/validation");
// const servicesFee = require("../lib/servicesFee");
// const libMap = require("../lib/map");
const eventManager = require("../lib/eventManager");

eventManager.once("ioInitialize", (io) => {
    // Thiết lập trình xử lý sự kiện 'connection' và 'disconnect' trong io
    io.on("connection", (socket) => {
        socket.on("notifyNewOrderFromUser", (info) => createNewOrder(info));
    });
});

const createNewOrder = async (info) => {
    try {
        const orderTime = new Date();

        // const { error } = OrderValidation.validateCreatingOrder(info);

        // if (error) {
        //     throw error;
        // }

        // Check conditions

        const agencyId = "BC_71000_077204005691";
        info.createdTime = orderTime;

        // const resultCreatingNewOrder = await ordersService.createNewOrder(info);

        // if (!resultCreatingNewOrder || resultCreatingNewOrder.affectedRows === 0) {
        //     return eventManager.emit("notifyFailCreatedNewOrder", "Tạo đơn hàng thất bại.");
        // }

        eventManager.emit("notifySuccessCreatedNewOrder", "Tạo đơn hàng thành công.");
        
        eventManager.emit("notifyNewOrderToAgency", {
            order: info,
            room: agencyId,
        });
    } catch (error) {
        return eventManager.emit("notifyError", error.message);
    }
}

const getOrders = async (req, res) => {
    res.render("order");
}

// const OrderValidation = new Validation.OrderValidation();

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

const createNewOrderOld = async (req, res) => {
    try {
        const orderTime = new Date();

        const { error } = OrderValidation.validateCreatingOrder(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const serviceType = req.body.service_type;
        
        if(serviceType === 1) {
            const provinceSource = req.body.province_source; //delete leading space
            const districtSource = req.body.district_source;
            const wardSource = req.body.ward_source;
            const addressSource = req.body.detail_source + ", " + wardSource + ", " + districtSource + ", " + provinceSource; 
            
            const resultFindingManagedAgency = await ordersService.findingManagedAgency(wardSource, districtSource, provinceSource);
            
            if (!resultFindingManagedAgency.success) {
                return res.status(404).json({
                    error: true,
                    message: resultFindingManagedAgency.message,
                });
            }

            const formattedOrderTime = moment(orderTime).format("YYYY-MM-DD HH:mm:ss");
            const agencies = resultFindingManagedAgency.data.agency_id;
            const areaAgencyIdSubParts = agencies[0].split('_');
            const orderId = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
            // const fee = await servicesFee.calculateExpressFee(serviceType, req.body.address_source, req.body.address_dest);
            const fee = 100000;

            req.body.order_id = orderId;
            req.body.order_time = formattedOrderTime;
            req.body.phone_number_sender = req.user.phone_number;
            req.body.journey = JSON.stringify(new Array());
            
            const resultCreatingNewOrder = await ordersService.createNewOrder(req.body);
            if (!resultCreatingNewOrder || resultCreatingNewOrder.length === 0) {
                throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
            }

            const resultCreatingNewOrderInAgency = await ordersService.createOrderInAgencyTable(req.body, resultFindingManagedAgency.data.postal_code[0]);
            if (!resultCreatingNewOrderInAgency || resultCreatingNewOrderInAgency.length === 0) {
                throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
            }
            
            // eventManager.emit("notifyNewOrder", newOrder);

            return res.status(201).json({
                error: false,
                message: "Tạo đơn hàng thành công.",
            });
        }
        else if (serviceType === 2) {
            const provinceSource = req.body.province_source; //delete leading space
            const districtSource = req.body.district_source;;
            const wardSource = req.body.ward_source;
            const addressSource = req.body.detail_source + ", " + wardSource + ", " + districtSource + ", " + provinceSource; 
            
            const provinceDest = req.body.province_dest;
            if(provinceDest !== provinceSource) {
                const error = new Error("Đơn hàng phải được giao nội tỉnh");
                error.status = 400;
                throw error;
            }
            
            const resultFindingManagedAgency = await ordersService.findingManagedAgency(wardSource, districtSource, provinceSource);
            
            if (!resultFindingManagedAgency.success) {
                return res.status(404).json({
                    error: true,
                    message: resultFindingManagedAgency.message,
                });
            }

            const formattedOrderTime = moment(orderTime).format("YYYY-MM-DD HH:mm:ss");
            const agencies = resultFindingManagedAgency.data.agency_id;
            const areaAgencyIdSubParts = agencies[0].split('_');
            const orderId = areaAgencyIdSubParts[0] + '_' + areaAgencyIdSubParts[1] + '_' + orderTime.getFullYear().toString() + (orderTime.getMonth() + 1).toString() + orderTime.getDate().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
            // const fee = await servicesFee.calculateExpressFee(serviceType, req.body.address_source, req.body.address_dest);
            const fee = 100000;

            req.body.order_id = orderId;
            req.body.order_time = formattedOrderTime;
            req.body.phone_number_sender = req.user.phone_number;
            req.body.journey = JSON.stringify(new Array());

            const resultCreatingNewOrder = await ordersService.createNewOrder(req.body);
            if (!resultCreatingNewOrder || resultCreatingNewOrder.length === 0) {
                throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
            }

            const resultCreatingNewOrderInAgency = await ordersService.createOrderInAgencyTable(req.body, resultFindingManagedAgency.data.postal_code[0]);
            if (!resultCreatingNewOrderInAgency || resultCreatingNewOrderInAgency.length === 0) {
                throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
            }

            const resultGettingAvailableShipper = await ordersService.getAvailableShippers(req.body.province_source, req.body.district_source, req.body.ward_source);
            

            const shipperList = await ordersService.distributeOrder(managedAgency, req.body.address_source);
            const standardDeliveryTime = moment(orderTime).add(4, "hours").format("YYYY-MM-DD HH:mm:ss");

            eventManager.emit("notifyNewOrder", newOrder);

            return res.status(200).json({
                error: false,
                result: result[0],
                shipperList: shipperList,
                deadlineTime: standardDeliveryTime,
                message: "Tạo đơn giao nhanh nội tỉnh thành công!"
            });

        } else if(serviceType === 3) {
            const provinceSource = req.body.province_source; //delete leading space
            const districtSource = req.body.district_source;;
            const wardSource = req.body.ward_source;
            const addressSource = req.body.detail_source + ", " + wardSource + ", " + districtSource + ", " + provinceSource; 
            
            
            const provinceDest = req.body.province_dest;
            if(provinceDest !== provinceSource) {
                const error = new Error("Đơn hàng phải được giao nội tỉnh");
                error.status = 400;
                throw error;
            }

            const { agency_id: managedAgency, postal_code } = await ordersService.findingManagedAgency(wardSource, districtSource, provinceSource);
            

            const orderTime = new Date();
            const formattedOrderTime = moment(orderTime).format("YYYY-MM-DD HH:mm:ss");
            const orderId = "TD" + orderTime.getFullYear().toString() + orderTime.getMonth().toString() + orderTime.getDay().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();
            // const fee = await servicesFee.calculateExpressFee(serviceType, req.body.address_source, req.body.address_dest);

            const newOrder = new Object({
                //user_id: req.user.user_id || null,
                user_id: "00000001",
                order_id: orderId,
                name_sender: req.body.name_sender,
                phone_sender: req.body.phone_sender,
                name_reciever: req.body.name_reciever,	
                phone_reciever: req.body.phone_reciever,
                order_time: formattedOrderTime,
                mass: req.body.mass,
                height: req.body.height,
                width: req.body.width,
                length: req.body.length,
                coordinate_source: JSON.stringify([req.body.long_source, req.body.lat_source]),	
                address_source: req.body.address_source,	
                coordinate_dest: JSON.stringify([req.body.long_destination, req.body.lat_destination]),	 	
                address_dest:req.body.address_dest,	
                fee: fee,
                COD: req.body.COD,
                service_type: serviceType
            });



            await ordersService.createOrderInAgencyTable(newOrder, postal_code);
            const result = await ordersService.createNewOrder(newOrder);

            const shipperList = await ordersService.distributeOrder(managedAgency, req.body.address_source);
            const standardDeliveryTime = moment(orderTime).add(2, "hours").format("YYYY-MM-DD HH:mm:ss");

            eventManager.emit("notifyNewOrder", newOrder);

            return res.status(200).json({
                error: false,
                result: result[0],
                shipperList: shipperList,
                standardDeliveryTime: standardDeliveryTime,
                message: "Tạo đơn giao hỏa tốc nội tỉnh thành công!"
            });
        } else {
            const error = new Error("Không tồn tại phương thức vận chuyển");
            error.status = 400;
            throw error;
        }

        
    } catch (error) {
        console.log(error);
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
