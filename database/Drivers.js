const dbUtils = require("../lib/dbUtils");
const moment = require("moment");
const mysql = require("mysql2");
const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

const tasksTable = "driver_tasks";

const pool = mysql.createPool(dbOptions).promise();

const getTasks = async (conditions) => {
    let query = `SELECT d.*, s.* FROM shipment AS s JOIN ${tasksTable} as d ON s.shipment_id = d.shipment_id WHERE `;
    
    if (conditions.option === 1) {
        const today = moment(new Date()).format("YYYY-MM-DD");
        query += `DATE(d.created_at) = ?`;
        queryParams.push(today);
    }
    else if (conditions.option === 2) {
        const currentDate = new Date();

        const currentDayOfWeek = currentDate.getDay();

        const daysToAddForMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
        const daysToAddForSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;

        const mondayOfTheWeek = new Date(currentDate);
        mondayOfTheWeek.setDate(currentDate.getDate() + daysToAddForMonday);
        const mondayOfTheWeekFormatted = moment(mondayOfTheWeek).format("YYYY-MM-DD");

        const sundayOfTheWeek = new Date(currentDate);
        sundayOfTheWeek.setDate(currentDate.getDate() + daysToAddForSunday);
        const sundayOfTheWeekFormatted = moment(sundayOfTheWeek).format("YYYY-MM-DD");

        query += `DATE(d.created_at) > ? AND DATE(d.created_at) < ?`
        queryParams.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
    }
    
    delete conditions.option;

    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    if (fields && values && fields.length > 0 && values.length > 0) {
        query += ` AND ${fields.map(field => `${field} = ?`).join(" AND ")}`;
    }

    query += ` ORDER BY d.created_at DESC`;
    
    const result = (await pool.query(query, values))[0];

    if (!result) {
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }

    for (const elm of result) {
        try {
            if (elm.journey) {
                elm.journey = JSON.parse(elm.journey);
            }
        } catch (error) {
            // Nothing to do
        }
    }

    return result;
}

const assignNewTasks = async (shipment_ids, staff_id) => {
    const shipmentIdsSet = new Set(shipment_ids);

    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();

    for (const shipment_id of shipmentIdsSet) {
        try {
            const resultCreatingNewTask = await dbUtils.insert(pool, tasksTable, ["shipment_id", "driver"], [shipment_id, staff_id]);
            if (resultCreatingNewTask && resultCreatingNewTask.affectedRows > 0) {
                acceptedNumber++;
                acceptedArray.push(shipment_id);
            }
            else {
                notAcceptedNumber++;
                notAcceptedArray.push(shipment_id);
            }
        } catch (error) {
            notAcceptedNumber++;
            notAcceptedArray.push(shipment_id);
        }
    }

    return new Object({
        acceptedNumber,
        acceptedArray,
        notAcceptedNumber,
        notAcceptedArray,
    });
}

const confirmCompletedTask = async (id, driver_id) => {
    return await dbUtils.deleteOne(pool, tasksTable, ["id", "driver_id"], [id, driver_id]);
}

module.exports = {
    getTasks,
    assignNewTasks,
    confirmCompletedTask,

}