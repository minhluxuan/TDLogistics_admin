const mysql = require("mysql2");
const moment = require("moment");
const utils = require("./utils");
const { valid } = require("joi");
const dbOptions = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "admin",
    database: "tdlogistics",
};
const table = "vehicle";

const pool = mysql.createPool(dbOptions).promise();

const checkExistVehicle = async (field, value) => {
    const result = await utils.findOne(pool, table, field, value);
    return result.length > 0;
};

const createNewVehicle = async (fields, values) => {
    const defaultFields = ["mass", "order_id", "busy"];
    const defaultValues = [0, null, false];
    const allFields = [...fields, ...defaultFields];
    const allValues = [...values, ...defaultValues];
    return await utils.insert(pool, table, allFields, allValues);
};

// const query = "SELECT * FROM orders";
// const result = pool.query(query).then((result) => {
//     console.log(result);
//     console.log("oke");
// });
