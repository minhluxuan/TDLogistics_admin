const mysql = require("mysql2");
const SQLutils = require("../lib/dbUtils");

const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

const table = "customer_user";

const pool = mysql.createPool(dbOptions).promise();

const checkExistUser = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const result = await SQLutils.findOneIntersect(pool, table, fields, values);
    return result.length > 0;
};

const createNewUser = async (newUser) => {
    const fields = Object.keys(newUser);
    const values = Object.values(newUser);

    return await SQLutils.insert(pool, table, fields, values);
}

const getOneUser = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);console.log(fields, values);

    return await SQLutils.findOneIntersect(pool, table, fields, values);
}

const updateUserInfo = async (info, conditions) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    return await SQLutils.updateOne(pool, table, fields, values, conditionFields, conditionValues);
}

module.exports = {
    checkExistUser,
    createNewUser,
    getOneUser,
    updateUserInfo,
}
