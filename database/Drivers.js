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

const getObjectsCanHandleTask = async () => {
    const query = `SELECT v.transport_partner_id, v.agency_id, v.staff_id, v.vehicle_id, v.type, v.license_plate, 
    v.max_load, v.mass, v.busy, v.created_at, v.last_update, a.agency_name, t.transport_partner_name, p.fullname 
    FROM vehicle AS v 
    LEFT JOIN agency AS a ON v.agency_id = a.agency_id 
    LEFT JOIN transport_partner AS t ON v.transport_partner_id = t.transport_partner_id
    LEFT JOIN partner_staff AS p ON v.staff_id = p.staff_id
    WHERE v.transport_partner_id IS NOT NULL AND v.transport_partner_id != ""
    
    ORDER BY created_at DESC;`;
    return (await pool.query(query))[0];
}

const checkExistTask = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return (await dbUtils.findOneIntersect(pool, table, fields, values)).length > 0;
}

const getOneTask = async (condition) => {
    const fields = Object.keys(condition);
    const values = Object.values(condition);

    return await dbUtils.findOneIntersect(pool, table, fields, values);
}

const getTasks = async (conditions) => {
    let query = `SELECT * FROM ${tasksTable}`;
    
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
    }
    else {
        if (option === 1) {
            const today = moment(new Date()).format("YYYY-MM-DD");
            query += ` WHERE DATE(created_at) = ?`;
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
    
            query += ` WHERE DATE(created_at) > ? AND DATE(created_at) < ?`
            values.push(mondayOfTheWeekFormatted, sundayOfTheWeekFormatted);
        }
    
    }
    query += ` ORDER BY created_at DESC`;
    
    const result = (await pool.query(query, values))[0];

    if (!result) {
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }

    for (const task of result) {
        const shipment = (await dbUtils.findOneIntersect(pool, "shipment", ["shipment_id"], task.shipment_id))[0];
        if (shipment.journey) {
            delete shipment.journey;
        }
        task.shipment = shipment;
    }

    return result;
}

const assignNewTasks = async (shipment_ids, staff_id, vehicle_id) => {
    const shipmentIdsSet = new Set(shipment_ids);

    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();

    for (const shipment_id of shipmentIdsSet) {
        try {
            const resultCreatingNewTask = await dbUtils.insert(pool, tasksTable, ["shipment_id", "staff_id", "vehicle_id"], [shipment_id, staff_id, vehicle_id]);
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

const confirmCompletedTask = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.deleteOne(pool, tasksTable, fields, values);
}

module.exports = {
    getObjectsCanHandleTask,
    checkExistTask,
    getOneTask,
    getTasks,
    assignNewTasks,
    confirmCompletedTask,
}