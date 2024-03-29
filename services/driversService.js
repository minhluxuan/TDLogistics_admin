const Drivers = require("../database/Drivers");

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
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
}