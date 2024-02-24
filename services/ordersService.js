const Orders = require("../database/Orders");

const checkExistOrder = async (order_id) => {
    return Orders.checkExistOrder(order_id);
};
//just use for update order
const getOrderForUpdating = async (order_id) => {
    return await Orders.getOrderForUpdating(order_id);
}

const getOrdersByUserID = async (user_id, status_code = null) => {
    return await Orders.getOrdersByUserID(user_id, status_code);
}

const getOrderByOrderID = async (order_id) => {
    return await Orders.getOrderByOrderID(order_id);
}

const updateOrder = async (fields, values, conditionFields, conditionValues) => {
    return await Orders.updateOrder(fields, values, conditionFields, conditionValues);
};

const createNewOrder = async (newOrder) => {
    return await Orders.createNewOrder(newOrder);
}

const cancelOrder = async (fields, values)=> {
    return await Orders.cancelOrder(fields, values);
};

const getDistrictPostalCode = async (district, province) => {
    return await Orders.getDistrictPostalCode(district, province);
}

const getProvincePostalCode = async (province) => {
    return await Orders.getProvincePostalCode(province);
}

const findingManagedAgency = async (ward, district, province) => {
    return await Orders.findingManagedAgency(ward, district, province);
}

const createOrderInAgencyTable = async (newOrder, postalcode) => {
    return await Orders.createOrderInAgencyTable(newOrder, postalcode);
}

const getOrderStatus = async (order_id) => {
    return await Orders.getOrderStatus(order_id);
}
const distributeOrder = async (agency_id, address_source) => {
    return await Orders.distributeOrder(agency_id, address_source);
}

module.exports = {
    checkExistOrder,
    getOrderForUpdating,
    getOrdersByUserID,
    getOrderByOrderID,
    createNewOrder,
    updateOrder,
    cancelOrder,
    getDistrictPostalCode,
    getProvincePostalCode,
    findingManagedAgency,
    createOrderInAgencyTable,
    getOrderStatus,
    distributeOrder
};