const Schedule = require("../database/TodoList");

const createScheduleByAdmin = async (info) => {
    return await Schedule.createNewTaskByAdmin(info);
};

const createScheduleByAgency = async (info, postalCode) => {
    return await Schedule.createNewTaskAgency(info, postalCode);
};

const getOneTask = async (condition, postalCode = null) => {
    return await Schedule.getOneTask(condition, postalCode);
}

const getScheduleByAdmin = async (conditions) => {
    return await Schedule.getTasksByAdmin(conditions);
};

const getScheduleByAgency = async (conditions, postalCode) => {
    return await Schedule.getTasksByAgency(conditions, postalCode);
};

const updateScheduleByAdmin = async (info, conditions) => {
    return await Schedule.updateTaskByAdmin(info, conditions);
};

const updateScheduleByAgency = async (info, conditions, postalCode) => {
    return await Schedule.updateTaskByAgency(info, conditions, postalCode);
};

const deleteScheduleByAdmin = async (conditions) => {
    return await Schedule.deleteTaskByAdmin(conditions);
};

const deleteScheduleByAgency = async (conditions) => {
    return await Schedule.deleteTaskByAgency(conditions);
};

module.exports = {
    createScheduleByAdmin,
    createScheduleByAgency,
    getOneTask,
    getScheduleByAdmin,
    getScheduleByAgency,
    updateScheduleByAdmin,
    updateScheduleByAgency,
    deleteScheduleByAdmin,
    deleteScheduleByAgency,
};