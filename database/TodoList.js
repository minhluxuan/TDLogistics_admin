const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");
const staffDB = require("./Staffs");

const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

const table = "schedule"; //schedule/postalcode_schedule
const suffix = "_" + table;
const pool = mysql.createPool(dbOptions).promise();

const createNewTaskByAgency = async (info, postalCode) => {
    const agencyScheduleTable = postalCode + suffix;
    const fields = Object.keys(info);
    const values = Object.values(info);

    return await dbUtils.insert(pool, agencyScheduleTable, fields, values);
};

const createNewTaskByAdmin = async (info) => {
    const fields = Object.keys(info);
    const values = Object.values(info);
    return await dbUtils.insert(pool, table, fields, values);
};

const updateTaskByAgency = async (info, conditions, postalCode) => {
    const agencyScheuleTable = postalCode + suffix;
    const fields = Object.keys(info);
    const values = Object.values(info);
    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    return await dbUtils.update(pool, agencyScheuleTable, fields, values, conditionFields, conditionValues);
};

const updateTaskByAdmin = async (info, conditions) => {
    const fields = Object.keys(info);
    const values = Object.values(info);
    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

const getOneTask = async (condition, postal_code = null) => {
    const fields = Object.keys(condition);
    const values = Object.values(condition);

    const scheduleTable = postal_code ? postal_code + suffix : table;
    return await dbUtils.findOneIntersect(pool, scheduleTable, fields, values);
}

const getTasksByAgency = async (conditions, postalCode) => {
    const agencyScheduleTable = postalCode + suffix;
    let query = `SELECT * FROM ${agencyScheduleTable}`;
    let values = [];
    let whereClauseArray = [];

    for (let key in conditions) {
        if (key !== "deadline") {
            whereClauseArray.push(`${key} = ?`);
            values.push(conditions[key]);
        }
    }

    if (conditions.hasOwnProperty("deadline")) {
        whereClauseArray.push(`deadline < ?`);
        values.push(conditions.deadline);
    }

    if (whereClauseArray.length > 0) {
        query += " WHERE " + whereClauseArray.join(" AND ");
    }

    const result = await pool.query(query, values);
    return result[0];
};

const getTasksByAdmin = async (conditions) => {
    let query = `SELECT * FROM ${table}`;
    let values = [];
    let whereClauseArray = [];

    for (let key in conditions) {
        if (key !== "deadline") {
            whereClauseArray.push(`${key} = ?`);
            values.push(conditions[key]);
        }
    }

    if (conditions.hasOwnProperty("deadline")) {
        whereClauseArray.push(`deadline < ?`);
        values.push(conditions.deadline);
    }

    if (whereClauseArray.length > 0) {
        query += " WHERE " + whereClauseArray.join(" AND ");
    }

    const result = await pool.query(query, values);
    return result[0];
};

const deleteTaskByAgency = async (conditions, postal_code) => {
    const agencyScheduleTable = postal_code + suffix;
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.deleteOne(pool, agencyScheduleTable, fields, values);
};

const deleteTaskByAdmin = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.deleteOne(pool, table, fields, values);
};


module.exports = {
    createNewTaskByAgency,
    createNewTaskByAdmin,
    updateTaskByAgency,
    updateTaskByAdmin,
    getOneTask,
    getTasksByAgency,
    getTasksByAdmin,
    deleteTaskByAgency,
    deleteTaskByAdmin,
};