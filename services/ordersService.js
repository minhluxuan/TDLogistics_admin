const Orders = require("../database/Orders");

const checkExistOrder = async (info) => {
    return Orders.checkExistOrder(info);
};
//just use for update order
const getOrderForUpdating = async (order_id) => {
    return await Orders.getOrderForUpdating(order_id);
}

const getOrdersOfAgency = async (postalCode, conditions, paginationConditions) => {
    return await Orders.getOrdersOfAgency(postalCode, conditions, paginationConditions);
}

const getOneOrder = async (conditions) => {
    return await Orders.getOneOrder(conditions);
}

const getOrders = async (conditions, paginationConditions) => {
    return await Orders.getOrders(conditions, paginationConditions);
}

const updateOrder = async (info, conditions) => {
    return await Orders.updateOrder(info, conditions);
};

const createNewOrder = async (newOrder) => {
    return await Orders.createNewOrder(newOrder);
}

const cancelOrderWithTimeConstraint = async (conditions) => {
    return await Orders.cancelOrderWithTimeConstraint(conditions);
};

const cancelOrderWithoutTimeConstraint = async (conditions) => {
    return await Orders.cancelOrderWithoutTimeConstraint(conditions);
}

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
    getOrdersOfAgency,
    getOneOrder,
    getOrders,
    createNewOrder,
    updateOrder,
    cancelOrderWithTimeConstraint,
    cancelOrderWithoutTimeConstraint,
    getDistrictPostalCode,
    getProvincePostalCode,
    findingManagedAgency,
    createOrderInAgencyTable,
    getOrderStatus,
    distributeOrder
};