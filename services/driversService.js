const Drivers = require("../database/Drivers");

const getObjectsCanHandleTaskByAdmin = async () => {
    return await Drivers.getObjectsCanHandleTaskByAdmin();
}

const getObjectsCanHandleTaskByAgency = async (agencyId) => {
    return await Drivers.getObjectsCanHandleTaskByAgency(agencyId);
}

const checkExistTask = async (condition) => {
    return await Drivers.checkExistTask(condition);
}

const getOneTask = async (condition) => {
    return await Drivers.getOneTask(condition);
}

const getTasks = async (conditions, postalCode = null) => {
    return await Drivers.getTasks(conditions, postalCode);
}

const assignNewTasks = async (shipment_ids, staff_id, vehicle_id, postalCode = null) => {
    return await Drivers.assignNewTasks(shipment_ids, staff_id, vehicle_id, postalCode);
}

const confirmCompletedTask = async (conditions, postalCode = null) => {
    return await Drivers.confirmCompletedTask(conditions, postalCode);
}

const deleteTask = async (id, postalCode = null) => {
    return await Drivers.deleteTask(id, postalCode);
}

module.exports = {
    getObjectsCanHandleTaskByAdmin,
    getObjectsCanHandleTaskByAgency,
    checkExistTask,
    getOneTask,
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
    deleteTask,
}