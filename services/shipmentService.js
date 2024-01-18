const Shipment = require("../database/Shipment");

const createNewShipment = async (fields, values) => {
    return await Shipment.createNewShipment(fields, values);
}

const getDataForShipmentCode = async(staff_id, transport_partner_id = null) => {
    return await Shipment.getDataForShipmentCode(staff_id, transport_partner_id);
}

const updateShipment = async(fields, values, conditionFields, conditionValues) => {
    return await Shipment.updateShipment(fields, values, conditionFields, conditionValues);
}

const getShipmentForAdmin = async (fields, values) => {
    return await Shipment.getShipmentForAdmin(fields, values);
}

const getShipmentForAgency = async (fields, values) => {
    return await Shipment.getShipmentForAgency(fields, values);
}

const confirmCreateShipment = async (fields, values) => {
    return await Shipment.confirmCreateShipment(fields, values);
}

const getInfoShipment = async (shipment_id) => {
    return await Shipment.getInfoShipment(shipment_id);
}

const deleteShipment = async (shipment_id) => {
    return await Shipment.deleteShipment(shipment_id);
}

const decompseShipment = async (shipment_id) => {
    return await Shipment.decompseShipment(shipment_id);
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    return await Shipment.updateShipmentToDatabase(fields, values, shipment_id);
}

module.exports = {
    createNewShipment,
    getDataForShipmentCode,
    updateShipment,
    getShipmentForAdmin,
    getShipmentForAgency,
    getInfoShipment,
    confirmCreateShipment,
    deleteShipment,
    updateShipmentToDatabase,
    decompseShipment,
};