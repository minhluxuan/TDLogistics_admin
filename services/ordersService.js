const Orders = require("../database/Orders");

const checkExistOrder = async (order_id) => {
    return Orders.checkExistOrder(order_id);
};

const getAllOrders = async () => {
    return await Orders.getAllOrders();
};

const getOrder = async (data) => {
    return await Orders.getOrder(data);
};

const updateOrder = async (fields, values, conditionFields, conditionValues) => {
    return await Orders.updateOrder(fields, values, conditionFields, conditionValues);
};

const createNewOrder = async (fields, values) => {
    return await Orders.createNewOrder(fields, values);
}

const cancelOrder = async (fields, values)=> {
    return await Orders.cancelOrder(fields, values);
};


module.exports = {
    checkExistOrder,
    getAllOrders,
    getOrder,
    createNewOrder,
    updateOrder,
    cancelOrder,
};