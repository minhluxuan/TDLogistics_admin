const Orders = require("../database/Orders");

const checkExistOrder = async (info) => {
    return Orders.checkExistOrder(info);
};
//just use for update order
const getOrderForUpdating = async (order_id) => {
    return await Orders.getOrderForUpdating(order_id);
}

const getOrdersOfAgency = async (postalCode, conditions) => {
    return await Orders.getOrdersOfAgency(postalCode, conditions);
}

const getOrders = async (conditions) => {
    return await Orders.getOrders(conditions);
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

const  setStatusToOrder = async (orderInfo, orderStatus, isUpdateJourney = false) => {
    return await Orders.setStatusToOrder(orderInfo, orderStatus, isUpdateJourney);
}

module.exports = {
    checkExistOrder,
    getOrderForUpdating,
    getOrdersOfAgency,
    getOrders,
    createNewOrder,
    updateOrder,
    cancelOrder,
    getDistrictPostalCode,
    getProvincePostalCode,
    findingManagedAgency,
    createOrderInAgencyTable,
    getOrderStatus,
    distributeOrder,
    setStatusToOrder
};