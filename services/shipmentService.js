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

const getShipment = async (fields, values) => {
    return await Shipment.getShipment(fields, values);
}

module.exports = {
    createNewShipment,
    getDataForShipmentCode,
    updateShipment,
    getShipment,
};