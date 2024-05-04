const Shippers = require("../database/Shippers");

const checkExistTask = async (conditions, postalCode) => {
    return await Shippers.checkExistTask(conditions, postalCode);
}

const getObjectsCanHandleTask = async (postalCode) => {
    return await Shippers.getObjectsCanHandleTask(postalCode);
}

const getOneTask = async (conditions, postalCode) => {
    return await Shippers.getOneTask(conditions, postalCode);
}

const getTasks = async (conditions, postalCode) => {
    return await Shippers.getTasks(conditions, postalCode);
}

const assignNewTasks = async (order_ids, staff_id, postal_code) => {
    return await Shippers.assignNewTasks(order_ids, staff_id, postal_code);
}

const confirmCompletedTask = async (id, staff_id, completedTime, postal_code) => {
    return await Shippers.confirmCompletedTask(id, staff_id, completedTime, postal_code);
}
const getHistory = async (conditions, postal_code) => {
    return await Shippers.getHistory(conditions, postal_code);
}

const deleteTask = async (id, postalCode) => {
    return await Shippers.deleteTask(id, postalCode);
}

module.exports = {
    checkExistTask,
    getObjectsCanHandleTask,
    getOneTask,
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
    getHistory,
    deleteTask,
}