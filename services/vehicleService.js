const { retryOptions } = require("@google/maps/lib/internal/convert");
const Vehicle = require("../database/Vehicles");

const checkExistVehicle = async (conditions) => {
    return await Vehicle.checkExistVehicle(conditions);
};

const createNewVehicle = async (info) => {
    return await Vehicle.createNewVehicle(info);
};

const getOneVehicle = async (conditions) => {
    return await Vehicle.getOneVehicle(conditions);
}

const getVehicle = async (conditions, paginationConditions) => {
    return await Vehicle.getManyVehicles(conditions, paginationConditions);
};

const getVehicleOrderIds = async (vehicle) => {
    return await Vehicle.getVehicleOrderIds(vehicle);
};


const updateVehicle = async (info, conditions) => {
    return await Vehicle.updateVehicle(info, conditions);
};

const deleteVehicle = async (conditions) => {
    return await Vehicle.deleteVehicle(conditions);
};

const addShipmentToVehicle = async(vehicle, shipment_ids) => {
    return await Vehicle.addShipmentToVehicle(vehicle, shipment_ids);
}

const deleteShipmentFromVehicle = async(vehicle, shipment_ids) => {
    return await Vehicle.deleteShipmentFromVehicle(vehicle, shipment_ids);
}

module.exports = {
    checkExistVehicle,
    createNewVehicle,
    updateVehicle,
    // addOrders,
    // deleteOrders,
    deleteVehicle,
    getVehicle,
    getOneVehicle,
    getVehicleOrderIds,
    addShipmentToVehicle,
    deleteShipmentFromVehicle
};
