const Vehicle = require("../database/Vehicles");

const checkExistVehicle = async (fields, values) => {
    return Vehicle.checkExistVehicle(fields, values);
};

const createNewVehicle = async (fields, values) => {
    return await Vehicle.createNewVehicle(fields, values);
};
const updateVehicle = async (fields, values) => {
    if (!Array.isArray(fields) || !Array.isArray(values)) {
        throw new Error("Fields and values must be arrays");
    }

    const orderIdIndex = fields.indexOf("order_ids");
    const vehicle_id = fields.indexOf("vehicle_id");
    if (orderIdIndex !== -1) {
        const orderIds = values[orderIdIndex];
        await Vehicle.handleOrderIds(vehicle_id, orderIds);
        fields.splice(orderIdIndex, 1);
        values.splice(orderIdIndex, 1);
    }
    return await Vehicle.updateVehicle(fields, values, ["vehicel_id"], [vehicle_id]);
};
const deleteVehicle = async (fields, values) => {
    return await Vehicle.deleteVehicle(fields, values);
};

module.exports = { checkExistVehicle, createNewVehicle, updateVehicle, deleteVehicle };
