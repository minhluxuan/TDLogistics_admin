const Shipment = require("../database/Shipments");

const createNewShipment = async (fields, values, agency_id) => {
    return await Shipment.createNewShipment(fields, values, agency_id);
}

const getDataForShipmentCode = async(staff_id, transport_partner_id = null) => {
    return await Shipment.getDataForShipmentCode(staff_id, transport_partner_id);
}

const updateShipment = async(fields, values, conditionFields, conditionValues, agency_id) => {
    return await Shipment.updateShipment(fields, values, conditionFields, conditionValues, agency_id);
}

const getShipmentForAdmin = async (fields, values) => {
    return await Shipment.getShipmentForAdmin(fields, values);
}

const getShipmentForAgency = async (fields, values, agency_id) => {
    return await Shipment.getShipmentForAgency(fields, values, agency_id);
}

const updateParentForGlobalOrders = async (shipment_id, agency_id) => {
    await Shipment.updateParentForGlobalOrders(shipment_id, agency_id);
}

const confirmCreateShipment = async (fields, values) => {
    return await Shipment.confirmCreateShipment(fields, values);
}

const getInfoShipment = async (shipment_id, agency_id) => {
    return await Shipment.getInfoShipment(shipment_id, agency_id);
}

const deleteShipment = async (shipment_id, agency_id) => {
    return await Shipment.deleteShipment(shipment_id, agency_id);
}

const deleteGlobalShipment = async (shipment_id) => {
    return await Shipment.deleteGlobalShipment(shipment_id);
}

const decomposeShipment = async (shipment_id, order_ids, agency_id) => {
    return await Shipment.decomposeShipment(shipment_id, order_ids, agency_id);
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    return await Shipment.updateShipmentToDatabase(fields, values, shipment_id);
}

const recieveShipment = async (shipment_id, agency_id) => {
    return await Shipment.recieveShipment(shipment_id, agency_id);
}

const addOrderToShipment = async (shipment_id, order_id, agency_id) => {
    return await Shipment.addOrderToShipment(shipment_id, order_id, agency_id);
}

const deleteOrderFromShipment = async (shipment_id, order_id, agency_id) => {
    return await Shipment.deleteOrderFromShipment(shipment_id, order_id, agency_id);
}

module.exports = {
    createNewShipment,
    getDataForShipmentCode,
    updateShipment,
    getShipmentForAdmin,
    getShipmentForAgency,
    getInfoShipment,
    updateParentForGlobalOrders,
    confirmCreateShipment,
    recieveShipment,
    addOrderToShipment,
    deleteOrderFromShipment,
    deleteShipment,
    deleteGlobalShipment,
    updateShipmentToDatabase,
    decomposeShipment,
};