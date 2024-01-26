const { retryOptions } = require("@google/maps/lib/internal/convert");
const Vehicle = require("../database/Vehicles");

const checkExistVehicle = async (fields, values) => {
    return await Vehicle.checkExistVehicle(fields, values);
};

const createNewVehicle = async (fields, values) => {
    return await Vehicle.createNewVehicle(fields, values);
};

const getVehicle = async (fields, values) => {
    return await Vehicle.getManyVehicles(fields, values);
};

const getVehicleOrderIds = async (fields, values) => {
    return await Vehicle.getVehicleOrderIds(fields, values);
};

const addOrders = async (vehicle_id, order_ids) => {
    return await Vehicle.addOrders(vehicle_id, order_ids);
}

const deleteOrders = async (vehicle_id, order_ids) => {
    return await Vehicle.deleteOrders(vehicle_id, order_ids);
}

const updateVehicle = async (fields, values, conditionFields, conditionValues) => {
    return await Vehicle.updateVehicle(fields, values, conditionFields, conditionValues);
};

const deleteVehicle = async (fields, values) => {
    return await Vehicle.deleteVehicle(fields, values);
};

module.exports = {
    checkExistVehicle,
    createNewVehicle,
    updateVehicle,
    addOrders,
    deleteOrders,
    deleteVehicle,
    getVehicle,
    getVehicleOrderIds,
};
