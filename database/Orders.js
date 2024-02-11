const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");

const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

const table = "orders";

const pool = mysql.createPool(dbOptions).promise();

const checkExistOrder = async (order_id) => {
    const result = await dbUtils.findOne(pool, table, ["order_id"], [order_id]);
    return result.length > 0;
};

const getOneOrder = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);
    
    return await dbUtils.findOneIntersect(pool, table, fields, values);
}

const getAllOrders = async () => {
    return await dbUtils.find(pool, table);
};

const getOrder = async (data) => {
    let whereClause = ``;

    const timeInterval = new Array();

    if (data.hasOwnProperty("start_order_time") && !data.hasOwnProperty("end_order_time") || !data.hasOwnProperty("start_order_time") && data.hasOwnProperty("end_order_time") || data.start_order_time > data.end_order_time) {
        throw new Error("Thông tin không hợp lệ.");
    }
    else if (data.hasOwnProperty("start_order_time") && data.hasOwnProperty("end_order_time")) {
        whereClause += `? <= order_time AND order_time <= ? AND `;
        timeInterval.push(data.start_order_time);
        timeInterval.push(data.end_order_time);
        delete data["start_order_time"];
        delete data["end_order_time"];
    }

    whereClause += `${Object.keys(data).map(field => `${field} = ?`).join(" AND ")}`;
    let values = Object.values(data);
    values = [...timeInterval, ...values];

    const query = `SELECT order_id, user_id, order_time, mass, height, width, length, long_source, lat_source, long_destination, lat_destination, address_source, address_destination, fee, COD, status_code FROM ${table} WHERE ${whereClause}`;

    const result = await pool.query(query, values);

    return result[0];
};

const createNewOrder = async (fields, values) => {
    console.log(fields);
    return await dbUtils.insert(pool, table, fields, values);
}

const updateOrder = async (fields, values, conditionFields, conditionValues) => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 30);
    const formattedTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
    
    const setClause = `${fields.map(field => `${field} = ?`).join(", ")}`;
    const whereClause = `${conditionFields.map(field => `${field} = ?`).join(" AND ")} AND order_time > ?`;

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    const result = await pool.query(query, [...values, ...conditionValues, formattedTime]);
    return result[0];
};

const cancelOrder = async (fields, values) => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 30);
    const formattedTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
    const whereClause = `${fields.map(field => `${field} = ?`).join(" AND ")} AND order_time > ?`;
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    const result = await pool.query(query, [...values, formattedTime]);
    return result[0];
};

module.exports = {
    checkExistOrder,
    getOneOrder,
    getAllOrders,
    getOrder,
    createNewOrder,
    updateOrder,
    cancelOrder,
};