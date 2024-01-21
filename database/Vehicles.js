const mysql = require("mysql2");
const moment = require("moment");
const utils = require("./utils");
const { valid } = require("joi");

const jsonArray = new utils.jsonArray();
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
const updateVehicle = async (fields, values, conditionFields, conditionValues) => {
    return await update(pool, table, fields, values, conditionFields, conditionValues);
};

const handleOrderIds = async (vehicleId, orderIds) => {
    const conditionFields = "id";
    const conditionValues = vehicleId;
    const fields = "order_id";
    const arrayName = "record";

    if (orderIds.append) {
        const newValues = orderIds.append;
        await jsonArray.append(pool, table, fields, arrayName, newValues, conditionFields, conditionValues);
    }

    if (orderIds.replace) {
        for (let [oldOrder, newOrder] of Object.entries(orderIds.replace)) {
            await jsonArray.replace(
                pool,
                table,
                fields,
                arrayName,
                oldOrder,
                newOrder,
                conditionFields,
                conditionValues
            );
        }
    }

    if (orderIds.delete) {
        for (let order of orderIds.delete) {
            await jsonArray.delete(pool, table, fields, arrayName, order, conditionFields, conditionValues);
        }
    }
};

const order_ids = {
    append: ["donhang3"],
};

const vehicle_id = 4;

handleOrderIds(vehicle_id, order_ids);

// const query = "SELECT * FROM orders";
// const result = pool.query(query).then((result) => {
//     console.log(result);
//     console.log("oke");
// });
