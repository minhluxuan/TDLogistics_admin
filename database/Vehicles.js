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
const getManyVehicles = async (fields, values) => {
    return await utils.find(pool, table, fields, values);
};

const getOneVehicle = async (fields, values) => {
    return await utils.findOne(pool, table, fields, values);
};
const updateVehicle = async (fields, values, conditionFields, conditionValues) => {
    return await update(pool, table, fields, values, conditionFields, conditionValues);
};

//based on Vehicle_id and orderIds is a object
const handleOrderIds = async (vehicleId, orderIds) => {
    if (typeof orderIds !== "object" || orderIds === null || Array.isArray(orderIds)) {
        throw new Error("orderIds must be a JSON object");
    }
    const conditionFields = ["id"];
    const conditionValues = [vehicleId];
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
                [oldOrder],
                [newOrder],
                conditionFields,
                conditionValues
            );
        }
    }

    if (orderIds.delete) {
        for (let order of orderIds.delete) {
            await jsonArray.delete(pool, table, fields, arrayName, [order], conditionFields, conditionValues);
        }
    }
};
const deleteVehicle = async (fields, values) => {
    return await utils.deleteOne(pool, table, fields, values);
};
module.exports = {
    checkExistVehicle,
    createNewVehicle,
    getManyVehicles,
    getOneVehicle,
    updateVehicle,
    handleOrderIds,
    deleteVehicle,
};
// const order_ids = {
//     replace: { donhang1: "donhang6" },
//     append: ["donhang1", "donhang2"],
//     delete: ["donhang2", "donhang3"],
// };

// const vehicle_id = 3;

// handleOrderIds(vehicle_id, order_ids);
// const fieldNames = ["transport_partner_id", "staff_id", "type", "vehicle_id", "license_plate", "max_load"];
// const fieldValues = ["abcd", "efg", "truck", "VH001", "ABC-123", 1000];

//createNewVehicle(fieldNames, fieldValues);
// const query = "SELECT * FROM orders";
// const result = pool.query(query).then((result) => {
//     console.log(result);
//     console.log("oke");
// });
