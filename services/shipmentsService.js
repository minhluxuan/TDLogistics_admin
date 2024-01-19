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

const confirmCreateShipment = async (fields, values) => {
    return await Shipment.confirmCreateShipment(fields, values);
}

const getInfoShipment = async (shipment_id, agency_id) => {
    return await Shipment.getInfoShipment(shipment_id, agency_id);
}

const deleteShipment = async (shipment_id, agency_id) => {
    return await Shipment.deleteShipment(shipment_id, agency_id);
}

const decompseShipment = async (shipment_id, agency_id) => {
    return await Shipment.decompseShipment(shipment_id, agency_id);
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