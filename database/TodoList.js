const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");
const staffDB = require("./Staffs");
const { info, error } = require("winston");

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

const createNewTaskAgency = async (info, postalCode) => {
    const agencyScheuleTable = postalCode + suffix;
    const fields = Object.keys(info);
    const values = Object.values(info);
    return await dbUtils.insert(pool, agencyScheuleTable, fields, values);
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

    const scheduleTable = postal_code ? postal_code + '_' + table : table;
    return await dbUtils.findOneIntersect(pool, scheduleTable, fields, values);
}

const getTasksByAgency = async (conditions, postalCode) => {
    const agencyScheduleTable = postalCode + suffix;
    let query = `SELECT * FROM ${agencyScheduleTable}`;
    let values = [];
    let whereClauses = [];

    for (let key in conditions) {
        if (key !== "deadline") {
            whereClauses.push(`${key} = ?`);
            values.push(conditions[key]);
        }
    }

    if (conditions.deadline) {
        whereClauses.push(`created_at BETWEEN ? AND ?`);
        values.push(new Date().toISOString().split("T")[0], conditions.deadline);
    }

    if (whereClauses.length > 0) {
        query += " WHERE " + whereClauses.join(" AND ");
    }

    console.log(pool.format(query, values));

    const result = await pool.query(query, values);
    return result[0];
};

const getTasksByAdmin = async (conditions) => {
    let query = `SELECT * FROM ${table}`;
    let values = [];
    let whereClauses = [];

    for (let key in conditions) {
        if (key !== "deadline") {
            whereClauses.push(`${key} = ?`);
            values.push(conditions[key]);
        }
    }

    if (conditions.deadline) {
        whereClauses.push(`created_at BETWEEN ? AND ?`);
        values.push(new Date().toISOString().split("T")[0], conditions.deadline);
    }

    if (whereClauses.length > 0) {
        query += " WHERE " + whereClauses.join(" AND ");
    }

    console.log(pool.format(query, values));

    const result = await pool.query(query, values);
    return result[0];
};

const deleteTaskByAgency = async (conditions) => {
    if (conditions.postal_code) {
        const agencyScheuleTable = conditions.postal_code + suffix;
        delete conditions.postal_code;
        const fields = Object.keys(conditions);
        const values = Object.values(conditions);
        return await dbUtils.deleteOne(pool, agencyScheuleTable, fields, values);
    } else {
        throw new Error("Không xác định được postal code");
    }
};

const deleteTaskByAdmin = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);
    return await dbUtils.deleteOne(pool, table, fields, values);
};
module.exports = {
    createNewTaskAgency,
    createNewTaskByAdmin,
    updateTaskByAgency,
    updateTaskByAdmin,
    getOneTask,
    getTasksByAgency,
    getTasksByAdmin,
    deleteTaskByAgency,
    deleteTaskByAdmin,
};