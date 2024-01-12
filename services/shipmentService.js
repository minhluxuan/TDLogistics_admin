const Shipment = require("../database/Shipment");

const createNewShipment = async (fields, values) => {
    return await Shipment.createNewShipment(fields, values);
}

const getDataForShipmentCode = async(staff_id, transport_partner_id = null) => {
    return await Shipment.getDataForShipmentCode(staff_id, transport_partner_id);
}

const updateShipment = async(order_ids, shipment_id) => {
    await Shipment.updateShipment(order_ids, shipment_id);
}

module.exports = {
    createNewShipment,
    getDataForShipmentCode,
    updateShipment,
};