const mysql = require("mysql2");
const utils = require("./utils");

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
    const defaultValues = [0, JSON.stringify({ record: [] }), false];
    const allFields = [...fields, ...defaultFields];
    const allValues = [...values, ...defaultValues];
    return await utils.insert(pool, table, allFields, allValues);
};
const getVehicle = async (fields = null, values = null) => {
    let query;

    const selectFields = "id, transport_partner_id, staff_id, vehicle_id, type, license_plate, mass, max_load, busy";
    if (fields !== null && values !== null) {
        const whereClause = fields.map((field) => `${field} = ? `).join(" AND ");
        query = `SELECT ${selectFields} FROM ${table} WHERE ${whereClause}`;
    } else {
        query = `SELECT ${selectFields} FROM ${table}`;
    }

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};
const getVehicleOrderID = async (vehicle_id) => {
    let query;
    const vehicleQuery = `SELECT order_id FROM vehicle WHERE vehicle_id = ?`;
    const vehicleResult = await pool.query(vehicleQuery, [vehicle_id]);

    if (vehicleResult[0].length === 0) {
        throw new Error("No vehicle found with the provided vehicle_id");
    }

    // this shit work and i dont know why?!
    let orderIds;
    if (typeof vehicleResult[0][0].order_id === "string") {
        orderIds = JSON.parse(vehicleResult[0][0].order_id).record;
    } else {
        orderIds = vehicleResult[0][0].order_id.record;
    }

    const placeholders = orderIds.map(() => "?").join(",");
    query = `SELECT * FROM orders WHERE order_id IN (${placeholders})`;

    try {
        const result = await pool.query(query, orderIds);
        console.log("Success!");
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};
const updateVehicle = async (fields, values, conditionFields, conditionValues) => {
    return await utils.update(pool, table, fields, values, conditionFields, conditionValues);
};

//based on Vehicle_id and orderIds is a object
const handleOrderIds = async (orderIds, conditionFields, conditionValues) => {
    if (typeof orderIds !== "object" || orderIds === null || Array.isArray(orderIds)) {
        throw new Error("orderIds must be a JSON object");
    }
    // const conditionFields = ["vehicle_id"];
    // const conditionValues = [vehicleId];
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
    getVehicle,
    getVehicleOrderID,
    updateVehicle,
    handleOrderIds,
    deleteVehicle,
};
// const fieldNames = ["transport_partner_id", "staff_id", "type", "vehicle_id", "license_plate", "max_load"];
// const fieldValues = ["TB001", "HCM_DVMH_001", "truck", "50A-B1-12345", "72A-123.45", 1000];
//createNewVehicle(fieldNames, fieldValues);

// const order_ids = {
//     append: ["DN001"],
// };
// const vehicle_id = 9;
//handleOrderIds(vehicle_id, order_ids);

// const query = "SELECT * FROM orders";
// const result = pool.query(query).then((result) => {
//     console.log(result);
//     console.log("oke");
// });
// deleteVehicle(["id"], [8]);

// getVehicleOrderID("50A-B1-12345")
//     .then((result) => console.log(result))
//     .catch((error) => console.error(error));
