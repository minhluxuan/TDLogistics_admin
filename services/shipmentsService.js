const Shipment = require("../database/Shipments");

const createNewShipment = async (fields, values, postal_code) => {
    return await Shipment.createNewShipment(fields, values, postal_code);
}

const getDataForShipmentCode = async(staff_id, transport_partner_id = null) => {
    return await Shipment.getDataForShipmentCode(staff_id, transport_partner_id);
}

const updateShipment = async(fields, values, conditionFields, conditionValues, postal_code) => {
    return await Shipment.updateShipment(fields, values, conditionFields, conditionValues, postal_code);
}

const getShipmentForAdmin = async (fields, values) => {
    return await Shipment.getShipmentForAdmin(fields, values);
}

const getShipmentForAgency = async (fields, values, postal_code) => {
    return await Shipment.getShipmentForAgency(fields, values, postal_code);
}

const updateParentForGlobalOrders = async (shipment_id, postal_code) => {
    await Shipment.updateParentForGlobalOrders(shipment_id, postal_code);
}

const confirmCreateShipment = async (fields, values) => {
    return await Shipment.confirmCreateShipment(fields, values);
}

const getInfoShipment = async (shipment_id, postal_code) => {
    return await Shipment.getInfoShipment(shipment_id, postal_code);
}

const deleteShipment = async (shipment_id, postal_code) => {
    return await Shipment.deleteShipment(shipment_id, postal_code);
}

const deleteGlobalShipment = async (shipment_id) => {
    return await Shipment.deleteGlobalShipment(shipment_id);
}

const decomposeShipment = async (shipment_id, order_ids, postal_code) => {
    return await Shipment.decomposeShipment(shipment_id, order_ids, postal_code);
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    return await Shipment.updateShipmentToDatabase(fields, values, shipment_id);
}

const recieveShipment = async (shipment_id, postal_code) => {
    return await Shipment.recieveShipment(shipment_id, postal_code);
}

const addOrderToShipment = async (shipment_id, order_id, postal_code) => {
    return await Shipment.addOrderToShipment(shipment_id, order_id, postal_code);
}

const deleteOrderFromShipment = async (shipment_id, order_id, postal_code) => {
    return await Shipment.deleteOrderFromShipment(shipment_id, order_id, postal_code);
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