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
const createNewTaskAgency = async (info) => {
    if (info.postal_code) {
        const agencyScheuleTable = info.postal_code + suffix;
        delete info.postal_code;
        const fields = Object.keys(info);
        const values = Object.values(info);
        return await dbUtils.insert(pool, agencyScheuleTable, fields, values);
    } else {
        throw new Error("Không xác định được postal code");
    }
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
    return await dbUtils.insert(pool, agencyScheuleTable, fields, values);
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
const updateTaskByAgency = async (info, conditions) => {
    if (conditions.postal_code) {
        const agencyScheuleTable = conditions.postal_code + suffix;
        delete conditions.postal_code;
        const fields = Object.keys(info);
        const values = Object.values(info);
        const conditionFields = Object.keys(conditions);
        const conditionValues = Object.values(conditions);
        return await dbUtils.update(pool, agencyScheuleTable, fields, values, conditionFields, conditionValues);
    } else {
        throw new Error("Không xác định được postal code");
    }
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
//     created_at: "",
//     completed_at: "",
//     priority: 1,
// });
const getTasksByAgency = async (conditions) => {
    if (conditions.postal_code) {
        const agencyScheuleTable = conditions.postal_code + suffix;
        delete info.postal_code;
        const fields = Object.keys(conditions);
        const values = Object.values(conditions);
        return await dbUtils.find(pool, agencyScheuleTable, fields, values);
    } else {
        throw new Error("Không xác định được postal code");
    }
};
//get by admin
// const conditions = new Object({
//     task: ""
//     created_at: "",
//     completed_at: "",
//     priority: 1,
// });
const getTasksByAdmin = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);
    return await dbUtils.find(pool, table, fields, values);
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
