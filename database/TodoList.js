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

// create new by agency
// const example = new Object({
//     postal_code: "11145",
//     task: "Create new task",
//     prioity: 1,
//     created_at: "",
// });
const createNewTaskAgency = async (info, postalCode) => {
    const agencyScheuleTable = postalCode + suffix;
    const fields = Object.keys(info);
    const values = Object.values(info);
    return await dbUtils.insert(pool, agencyScheuleTable, fields, values);
};
// create new by admin
// const example = new Object({
//     task: "Create new task",
//     prioity: 1,
//     created_at: "",
// });
const createNewTaskByAdmin = async (info) => {
    const fields = Object.keys(info);
    const values = Object.values(info);
    return await dbUtils.insert(pool, table, fields, values);
};
//update by agency
// const conditions = new Object({
//     postal_code: "11454",
//     created_at: "",
//     completed_at: "", // if this has complete then complete cant be in the updating, this logic is handle in the controller layers
//     priority: 1,
// });
// const updating = new Object({
//     task: "Additional changes for agency",
//     priority: 1,
//     completed_at:""
// });
const updateTaskByAgency = async (info, conditions, postalCode) => {
    const agencyScheuleTable = postalCode + suffix;
    const fields = Object.keys(info);
    const values = Object.values(info);
    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    return await dbUtils.update(pool, agencyScheuleTable, fields, values, conditionFields, conditionValues);
};

//update by admin
// const conditions = new Object({
//     created_at: "",
//     completed_at: "",
//     priority: 1,
// });
// const updating = new Object({
//     task: "Additional changes for agency",
//     priority: 1,
//     completed_at:""
// });
const updateTaskByAdmin = async (info, conditions) => {
    const fields = Object.keys(info);
    const values = Object.values(info);
    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

//get by agency
// const conditions = new Object({
//     postal_code: "11454",
//     task: "do the commit",
//     priority: 1,
//     deadline: 11/6/2024
// });
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
//get by admin
// const conditions = new Object({
//     task: ""
//      priority: 1,
// });
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
//delete by agency
// const conditions = new Object({
//     postal_code: "12233",
//     id: 123,
// });
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
//delete by admin
// const conditions = new Object({
//     id: 123,
// });
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
    getTasksByAgency,
    getTasksByAdmin,
    deleteTaskByAgency,
    deleteTaskByAdmin,
};
