const Shipment = require("../database/Shipments");

const checkExistShipment = async (shipment_id, agency_id) => {
    return await Shipment.checkExistShipment(shipment_id, agency_id);
}

const createNewShipment = async (info, postalCode) => {
    return await Shipment.createNewShipment(info, postalCode);
}

const getDataForShipmentCode = async(staff_id, transport_partner_id = null) => {
    return await Shipment.getDataForShipmentCode(staff_id, transport_partner_id);
}

const updateShipmentForAgency = async(info, conditions, postal_code) => {
    return await Shipment.updateShipmentForAgency(info, conditions, postal_code);
}

const getShipmentForAdmin = async (fields, values) => {
    return await Shipment.getShipmentForAdmin(fields, values);
}

const getOneShipment = async (conditions, postal_code = null) => {
    return await Shipment.getOneShipment(conditions, postal_code);
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

const decomposeShipment = async (shipment_id, order_ids, agency_id) => {
    return await Shipment.decomposeShipment(shipment_id, order_ids, agency_id);
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    return await Shipment.updateShipmentToDatabase(fields, values, shipment_id);
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
    updateShipmentForAgency,
    getShipmentForAdmin,
    getShipmentForAgency,
    getOneShipment,
    getInfoShipment,
    updateParentForGlobalOrders,
    confirmCreateShipment,
    recieveShipment,
    addOrdersToShipment,
    deleteOrdersFromShipment,
    deleteShipment,
    deleteGlobalShipment,
    updateShipmentToDatabase,
    decomposeShipment,
    undertakeShipment,
};