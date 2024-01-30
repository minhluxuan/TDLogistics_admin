const moment = require("moment");
const ordersService = require("../services/ordersService");
const utils = require("./utils");
const servicesUtils = require("../services/utils");

const checkExistOrder = async (req, res) => {
    try {
        const existed = await ordersService.checkExistOrder(req.query.order_id);
        return res.status(200).json({
            error: false, 
            existed: existed,
            message: existed ? "Đơn hàng đã tồn tại." : "Đơn hàng không tồn tại.",
        }); 
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
}

const getOrder = async (req, res) => {
    if(!req.isAuthenticated() || req.user.permission !== 1) {
        return res.status(401).json({
            error: true,
            message: "Bạn không được phép truy cập tài nguyên này.",
        });
    }

    const ordersValidation = new utils.OrderValidation(req.body);
    const { error } = ordersValidation.validateFindingOrder();

    if (error) {
        return res.status(400).json({
            error: true,
            message: "Thông tin không hợp lệ!",
        });
    }

    req.body.user_id = req.user.user_id;
    
    if (req.query.order_id) {
        req.body.order_id = req.query.order_id;
    }

    try {
        const orders = await ordersService.getOrder(req.body);
        return res.status(200).json({
            error: false,
            data: orders,
            message: "Lấy thông tin đơn hàng thành công!",
        }); 
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }
}

const createNewOrder = async (req, res) => {
    if(!req.isAuthenticated() || req.user.permisson < 1) {
        return res.status(401).json({
            error: true,
            message: "Bạn không được phép truy cập tài nguyên này.",
        });
    }

    try {
        const userRequestValidation = new utils.OrderValidation(req.body);

        const { error } = userRequestValidation.validateCreatingOrder();

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const map = new servicesUtils.Map();

        const source = {
            lat: req.body.lat_source,
            long: req.body.long_source,
        };

        const destination = {
            lat: req.body.lat_destination,
            long: req.body.long_destination,
        };

        const distance = (await map.calculateDistance(source, destination)).distance;

        const fee = servicesUtils.calculateFee(distance);

        const addressSource = await map.convertCoordinateToAddress(source);
        const addressDestination = await map.convertCoordinateToAddress(destination);

        const keys = new Array();
        const values = new Array();

        for (const key in req.body) {
            keys.push(key);
            values.push(req.body[key]);
        }

        const orderTime = new Date();
        const formattedOrderTime = moment(orderTime).format("YYYY-MM-DD HH:mm:ss");

        const orderId = "TD" + orderTime.getFullYear().toString() + orderTime.getMonth().toString() + orderTime.getDay().toString() + orderTime.getHours().toString() + orderTime.getMinutes().toString() + orderTime.getSeconds().toString() + orderTime.getMilliseconds().toString();

        keys.push("user_id");
        values.push(req.user.user_id);

        keys.push("order_id");
        values.push(orderId);

        keys.push("order_time");
        values.push(formattedOrderTime);

        keys.push("fee");
        values.push(fee);

        keys.push("address_source");
        values.push(addressSource);

        keys.push("address_destination");
        values.push(addressDestination);

        const result = await ordersService.createNewOrder(keys, values);
        
        return res.status(200).json({
            error: false,
            message: "Tạo đơn hàng thành công.",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error,
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

    const { error } = new utils.OrderValidation(req.body).validateUpdatingOrder();
    
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

        const map = new servicesUtils.Map();

        const distance = (await map.calculateDistance(source, destination)).distance;

        const updatingFee = servicesUtils.calculateFee(distance);

        const updatingAddressSource = await map.convertCoordinateToAddress(source);
        const updatingAddressDestination = await map.convertCoordinateToAddress(destination);

        await ordersService.updateOrder(["fee", "address_source", "address_destination"], [updatingFee, updatingAddressSource, updatingAddressDestination], ["order_id"], [orderId]);

        res.status(200).json({
            error: false,
            message: "Cập nhật thành công.",
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error,
        });
    }
};

const cancelOrder = async (req, res) => {
    if (!req.isAuthenticated() || req.user.permission !== 1) {
        return res.status(401).json({
            error: true,
            message: "Bạn không được phép truy cập tài nguyên này.",
        });
    }

    const orderId = req.query.order_id;

    const { error } = (new utils.OrderValidation({ order_id: orderId })).validateCancelingOrder();

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
    getOrder,
    createNewOrder,
    updateOrder,
    cancelOrder,
}
