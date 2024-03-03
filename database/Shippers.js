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
            const resultCreatingNewTask = await dbUtils.insert(pool, tasksTable, ["order_id", "shipper", "created_at"], [order_id, staff_id, createdAt]);
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

module.exports = {
    assignNewTasks,
}