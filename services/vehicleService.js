const Vehicle = require("../database/Vehicles");
const { checkExistStaff } = require("./staffsService");

const checkExistVehicle = async (fields, values) => {
    return Vehicle.checkExistVehicle(fields, values);
};

const createNewVehicle = async (fields, values) => {
    return await Vehicle.createNewVehicle(fields, values);
};

module.exports = { checkExistVehicle, createNewVehicle };
