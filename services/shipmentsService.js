const Shipment = require("../database/Shipments");

const checkExistShipment = async (conditions) => {
    return await Shipment.checkExistShipment(conditions);
}

const createNewShipment = async (info, postalCode) => {
    return await Shipment.createNewShipment(info, postalCode);
}

const getDataForShipmentCode = async(staff_id, transport_partner_id = null) => {
    return await Shipment.getDataForShipmentCode(staff_id, transport_partner_id);
}

const getOneShipment = async (conditions, postal_code = null) => {
    return await Shipment.getOneShipment(conditions, postal_code);
}

const getShipments = async (conditions, postal_code) => {
    return await Shipment.getShipments(conditions, postal_code);
}

const updateParentForGlobalOrders = async (order_ids, shipment_id) => {
    return await Shipment.updateParentForGlobalOrders(order_ids, shipment_id);
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
    let hitNumber = 0;
    const hitArray = new Array();
    let missNumber = 0;
    const missArray = new Array();
    for (const orderId of shipmentOrderIds) {
        if (requestOrderIds.includes(orderId)) {
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

const recieveShipment = async (shipment_id, postal_code) => {
    return await Shipment.recieveShipment(shipment_id, postal_code);
}

const addOrdersToShipment = async (shipment, order_ids, postal_code) => {
    return await Shipment.addOrdersToShipment(shipment, order_ids, postal_code);
}

const deleteOrdersFromShipment = async (shipment, order_id, postal_code) => {
    return await Shipment.deleteOrdersFromShipment(shipment, order_id, postal_code);
}

const undertakeShipment = async (shipment_id, staff_id, agency_id, status_code) => {
    return await Shipment.undertakeShipment(shipment_id, staff_id, agency_id, status_code);
}

module.exports = {
    checkExistShipment,
    createNewShipment,
    getDataForShipmentCode,
    getShipments,
    getOneShipment,
    updateParentForGlobalOrders,
    confirmCreateShipment,
    recieveShipment,
    addOrdersToShipment,
    deleteOrdersFromShipment,
    deleteShipment,
    deleteGlobalShipment,
    updateShipmentToDatabase,
    decomposeShipment,
    pasteShipmentToAgency,
    cloneOrdersFromGlobalToAgency,
    compareOrdersInRequestWithOrdersInShipment,
    undertakeShipment,
};