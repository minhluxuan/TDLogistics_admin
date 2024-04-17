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

const checkExistTask = async (conditions, postalCode) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions)

    return (await dbUtils.findOneIntersect(pool, postalCode + '_' + defaultTasksTable, fields, values)).length > 0;
}

const getObjectsCanHandleTask = async (agency_id) => {
    const query = `SELECT v.transport_partner_id, v.agency_id, v.staff_id, v.vehicle_id, v.type, v.license_plate, 
    v.max_load, v.mass, v.busy, v.created_at, v.last_update, a.agency_name, NULL AS transport_partner_name, s.fullname 
    FROM vehicle AS v 
    LEFT JOIN agency AS a ON v.agency_id = a.agency_id 
    LEFT JOIN staff AS s ON v.staff_id = s.staff_id 
    WHERE v.agency_id = ?
    ORDER BY created_at DESC;`

    return (await pool.query(query, [agency_id]))[0];
}

const getTasks = async (conditions, postal_code) => {
    const shipperTasksTable = postal_code + '_' + defaultTasksTable;

    let query = `SELECT * FROM ${shipperTasksTable}`;

    const option = conditions.option;

    delete conditions.option;

    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    if (fields && values && fields.length > 0 && values.length > 0) {
        query += ` WHERE ${fields.map(field => `${field} = ?`).join(" AND ")}`;

        if (option === 0) {
            query += " AND completed = false";
        }
        else if (option === 1) {
            const today = moment(new Date()).format("YYYY-MM-DD");
            query += " AND DATE(created_at) = ? AND completed = false";
            values.push(today);
        }
        else if (option === 2) {
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
    
            query += " AND DATE(created_at) > ? AND DATE(created_at) < ? AND completed = false";
            values.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
        }
    }
    else {
        if (option === 0) {
            query += " WHERE completed = false";
        }
        else if (option === 1) {
            const today = moment(new Date()).format("YYYY-MM-DD");
            query += " WHERE DATE(created_at) = ? AND completed = false";
            values.push(today);
        }
        else if (option === 2) {
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
    
            query += " WHERE DATE(created_at) > ? AND DATE(created_at) < ? AND completed = false";
            values.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
        }
    }
    query += ` ORDER BY created_at DESC`;
    
    const result = (await pool.query(query, values))[0];

    if (!result) {
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }

    for (const task of result) {
        const order = (await dbUtils.findOneIntersect(pool, "orders", ["order_id"], [task.order_id]))[0];
        if (order.journey) {
            delete order.journey;
        }
        task.order = order;
    }

    return result;
}

const assignNewTasks = async (order_ids, staff_id, postal_code) => {
    const orderIdsSet = new Set(order_ids);

    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();

    const tasksTable = postal_code + '_' + defaultTasksTable;
    for (const order_id of orderIdsSet) {
        try {
            const resultCreatingNewTask = await dbUtils.insert(pool, tasksTable, ["order_id", "staff_id", "completed"], [order_id, staff_id, false]);
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
    return await dbUtils.updateOne(pool, postal_code + '_' + defaultTasksTable, ["completed_at", "completed"], [completedTime, true], ["id", "staff_id", "completed"], [id, staff_id, false]);
}

const getHistory = async (conditions, postal_code) => {
    const shipperTasksTable = postal_code + '_' + defaultTasksTable;
    
    let query = `SELECT * FROM ${shipperTasksTable}`;

    const option = conditions.option;

    delete conditions.option;

    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    if (fields && values && fields.length > 0 && values.length > 0) {
        query += ` WHERE ${fields.map(field => `${field} = ?`).join(" AND ")}`;

        if (option === 1) {
            const today = moment(new Date()).format("YYYY-MM-DD");
            query += " AND DATE(created_at) = ?";
            values.push(today);
        }
        else if (option === 2) {
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
    
            query += " AND DATE(created_at) > ? AND DATE(created_at) < ?";
            values.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
        }
        else if (option === 3) {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
            // Lấy ngày cuối tháng của thời điểm hiện tại
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
            const firstDayOfMonthFormatted = moment(firstDayOfMonth).format("YYYY-MM-DD");
            const lastDayOfMonthFormatted = moment(lastDayOfMonth).format("YYYY-MM-DD");
    
            query += " AND DATE(created_at) > ? AND DATE(created_at) < ?";
            values.push(firstDayOfMonthFormatted, lastDayOfMonthFormatted);
        }
    }
    else {
        if (option === 1) {
            const today = moment(new Date()).format("YYYY-MM-DD");
            query += " WHERE DATE(created_at) = ?";
            values.push(today);
        }
        else if (option === 2) {
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
    
            query += " WHERE DATE(created_at) > ? AND DATE(created_at) < ?";
            values.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
        }
        else if (option === 3) {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
            // Lấy ngày cuối tháng của thời điểm hiện tại
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
            const firstDayOfMonthFormatted = moment(firstDayOfMonth).format("YYYY-MM-DD");
            const lastDayOfMonthFormatted = moment(lastDayOfMonth).format("YYYY-MM-DD");
    
            query += " WHERE DATE(created_at) > ? AND DATE(created_at) < ?";
            values.push(firstDayOfMonthFormatted, lastDayOfMonthFormatted);
        }
    }
    query += ` ORDER BY created_at DESC`;
    
    const result = (await pool.query(query, values))[0];

    if (!result) {
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }

    for (const task of result) {
        const order = (await dbUtils.findOneIntersect(pool, "orders", ["order_id"], [task.order_id]))[0];
        if (order.journey) {
            delete order.journey;
        }
        task.order = order;
    }

    return result;
}

const deleteTask = async (id, postalCode) => {
    const shipperTasksTable = postalCode + '_' + defaultTasksTable;
    return await dbUtils.deleteOne(pool, shipperTasksTable, ["id"], [id]);
}

module.exports = {
    checkExistTask,
    getObjectsCanHandleTask,
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
    getHistory,
    deleteTask,
}