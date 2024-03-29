const Drivers = require("../database/Drivers");

const getTasks = async (conditions) => {
    return await Drivers.getTasks(conditions);
}

const assignNewTasks = async (shipment_ids, staff_id) => {
    return await Drivers.assignNewTasks(shipment_ids, staff_id);
}

const confirmCompletedTask = async (id, staff_id) => {
    return await Drivers.confirmCompletedTask(id, staff_id);
}

module.exports = {
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
}