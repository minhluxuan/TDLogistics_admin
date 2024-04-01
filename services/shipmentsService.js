const Shipment = require("../database/Shipments");

const checkExistShipment = async (conditions, postalCode = null) => {
    return await Shipment.checkExistShipment(conditions, postalCode);
}

const createNewShipment = async (shipmentInfo, journeyInfo, postalCode = null) => {
    return await Shipment.createNewShipment(shipmentInfo, journeyInfo, postalCode);
}

const getDataForShipmentCode = async(staff_id, transport_partner_id = null) => {
    return await Shipment.getDataForShipmentCode(staff_id, transport_partner_id);
}

const getOneShipment = async (conditions, postal_code = null) => {
    return await Shipment.getOneShipment(conditions, postal_code);
}

const getShipments = async (conditions, paginationConditions, postal_code = null) => {
    return await Shipment.getShipments(conditions, paginationConditions, postal_code);
}

const updateParentForGlobalOrders = async (order_ids, shipment_id) => {
    return await Shipment.updateParentForGlobalOrders(order_ids, shipment_id);
}

const updateShipment = async (info, condtions, postal_code = null) => {
    return await Shipment.updateShipment(info, condtions, postal_code);
}

const confirmCreateShipment = async (info) => {
    return await Shipment.confirmCreateShipment(info);
}

const deleteShipment = async (shipment_id, postal_code = null) => {
    return await Shipment.deleteShipment(shipment_id, postal_code);
}

const deleteGlobalShipment = async (shipment_id) => {
    return await Shipment.deleteGlobalShipment(shipment_id);
}

const decomposeShipment = async (order_ids, shipment_id, agency_id) => {
    return await Shipment.decomposeShipment(order_ids, shipment_id, agency_id);
}

const compareOrdersInRequestWithOrdersInShipment = async (requestOrderIds, shipmentOrderIds) => {
    const requestOrderIdsSet = new Set(requestOrderIds);
    const shipmentOrderIdsSet = new Set(shipmentOrderIds);

    let hitNumber = 0;
    const hitArray = new Array();
    let missNumber = 0;
    const missArray = new Array();
    for (const orderId of shipmentOrderIdsSet) {
        if (requestOrderIdsSet.has(orderId)) {
            hitNumber++;
            hitArray.push(orderId);
        }
        else {
            missNumber++;
            missArray.push(orderId);
        }
    }

    return new Object({
        hitNumber,
        hitArray,
        missNumber,
        missArray,
    });
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    return await Shipment.updateShipmentToDatabase(fields, values, shipment_id);
}

const pasteShipmentToAgency = async (shipment, postalCode) => {
    return await Shipment.pasteShipmentToAgency(shipment, postalCode);
}

const cloneOrdersFromGlobalToAgency = async (order_ids, postalCode) => {
    return await Shipment.cloneOrdersFromGlobalToAgency(order_ids, postalCode);
}

const receiveShipment = async (shipment_id, postal_code) => {
    return await Shipment.receiveShipment(shipment_id, postal_code);
}

const getOrdersFromShipment = async (order_ids) => {
    return await Shipment.getOrdersFromShipment(order_ids);
}

const addOrdersToShipment = async (shipment, order_ids, postal_code) => {
    return await Shipment.addOrdersToShipment(shipment, order_ids, postal_code);
}

const deleteOrdersFromShipment = async (shipment, order_id, postal_code) => {
    return await Shipment.deleteOrdersFromShipment(shipment, order_id, postal_code);
}

const addOneShipmentToVehicle = async (shipment_id, staff_id) => {
    return await Shipment.addOneShipmentToVehicle(shipment_id, staff_id);
}

const updateOrders = async (order_ids, staff_ids, postal_code) => {
    return await Shipment.updateOrders(order_ids, staff_ids, postal_code);
}

const updateJourney = async (shipment_id, updatedTime, message) => {
    return await Shipment.updateJourney(shipment_id, updatedTime, message);
}

module.exports = {
    checkExistShipment,
    createNewShipment,
    getDataForShipmentCode,
    getShipments,
    getOneShipment,
    updateParentForGlobalOrders,
    confirmCreateShipment,
    receiveShipment,
    getOrdersFromShipment,
    addOrdersToShipment,
    deleteOrdersFromShipment,
    deleteShipment,
    deleteGlobalShipment,
    updateShipmentToDatabase,
    decomposeShipment,
    pasteShipmentToAgency,
    cloneOrdersFromGlobalToAgency,
    compareOrdersInRequestWithOrdersInShipment,
    addOneShipmentToVehicle,
    updateOrders,
    updateJourney,
    updateShipment,
};