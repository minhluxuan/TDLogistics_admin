const Shippers = require("../database/Shippers");

const getTasks = async (conditions, postalCode) => {
    return await Shippers.getTasks(conditions, postalCode);
}

const assignNewTasks = async (order_ids, staff_id, postal_code) => {
    return await Shippers.assignNewTasks(order_ids, staff_id, postal_code);
}

const confirmCompletedTask = async (id, staff_id, postal_code) => {
    return await Shippers.confirmCompletedTask(id, staff_id, postal_code);
}
const getHistory = async (conditions, postal_code) => {
    return await Shippers.getHistory(conditions, postal_code);
}

module.exports = {
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
    getHistory,
}