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

const defaultTasksTable = "shipper_tasks";

const pool = mysql.createPool(dbOptions).promise();

const getTasks = async (conditions, postal_code) => {
    const shipperTasksTable = postal_code + '_' + defaultTasksTable;
    const queryParams = [conditions.staff_id, false];

    let query = `SELECT s.*, o.* FROM orders AS o JOIN ${shipperTasksTable} as s ON o.order_id = s.order_id WHERE s.shipper = ? AND s.completed = ?`;
    
    if (conditions.option === 1) {
        const today = moment(new Date()).format("YYYY-MM-DD");
        query += ` AND DATE(s.created_at) = ?`;
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

        query += ` AND DATE(s.created_at) > ? AND DATE(s.created_at) < ?`
        queryParams.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
    }
    query += ` ORDER BY s.created_at DESC`;
    
    const result = (await pool.query(query, queryParams))[0];

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

const assignNewTasks = async (order_ids, staff_id, postal_code) => {
    const orderIdsSet = new Set(order_ids);
    const createdAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();

    const tasksTable = postal_code + '_' + defaultTasksTable;
    for (const order_id of orderIdsSet) {
        try {
            const resultCreatingNewTask = await dbUtils.insert(pool, tasksTable, ["order_id", "shipper", "created_at", "completed"], [order_id, staff_id, createdAt, false]);
            if (resultCreatingNewTask && resultCreatingNewTask.affectedRows > 0) {
                acceptedNumber++;
                acceptedArray.push(order_id);
            }
            else {
                notAcceptedNumber++;
                notAcceptedArray.push(order_id);
            }
        } catch (error) {
            notAcceptedNumber++;
            notAcceptedArray.push(order_id);
        }
    }

    return new Object({
        acceptedNumber,
        acceptedArray,
        notAcceptedNumber,
        notAcceptedArray,
    });
}

const confirmCompletedTask = async (id, staff_id, completedTime, postal_code) => {
    return await dbUtils.updateOne(pool, postal_code + '_' + defaultTasksTable, ["completed_at", "completed"], [completedTime, true], ["id", "shipper", "completed"], [id, staff_id, false]);
}

const getHistory = async (conditions, postal_code) => {
    const shipperTasksTable = postal_code + '_' + defaultTasksTable;
    const queryParams = [conditions.staff_id];

    let query = `SELECT s.*, o.* FROM orders AS o JOIN ${shipperTasksTable} as s ON o.order_id = s.order_id WHERE s.shipper = ? ORDER BY s.created_at`;
    
    if (conditions.option === 1) {
        const today = moment(new Date()).format("YYYY-MM-DD");
        query += ` AND DATE(s.created_at) = ?`;
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

        query += ` AND DATE(s.created_at) > ? AND DATE(s.created_at) < ?`
        queryParams.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
    }
    else if (conditions.option === 3) {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Lấy ngày cuối tháng của thời điểm hiện tại
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const firstDayOfMonthFormatted = moment(firstDayOfMonth).format("YYYY-MM-DD");
        const lastDayOfMonthFormatted = moment(lastDayOfMonth).format("YYYY-MM-DD");

        query += ` AND DATE(s.created_at) > ? AND DATE(s.created_at) < ?`
        queryParams.push(firstDayOfMonthFormatted, lastDayOfMonthFormatted);
    }
    query += ` ORDER BY s.created_at DESC`;
    
    const result = (await pool.query(query, queryParams))[0];

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

module.exports = {
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
    getHistory,
}