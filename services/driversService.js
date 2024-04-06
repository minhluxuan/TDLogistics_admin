const Drivers = require("../database/Drivers");

const getObjectsCanHandleTask = async () => {
    return await Drivers.getObjectsCanHandleTask();
}

const checkExistTask = async (condition) => {
    return await Drivers.checkExistTask(condition);
}

const getTasks = async (conditions) => {
    return await Drivers.getTasks(conditions);
}

const assignNewTasks = async (shipment_ids, staff_id) => {
    return await Drivers.assignNewTasks(shipment_ids, staff_id);
}

const confirmCompletedTask = async (conditions) => {
    return await Drivers.confirmCompletedTask(conditions);
}

module.exports = {
    getObjectsCanHandleTask,
    checkExistTask,
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
}