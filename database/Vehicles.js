const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");
const Orders = require("./Orders");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "vehicle";

const pool = mysql.createPool(dbOptions).promise();

const checkExistVehicle = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const result = await dbUtils.findOneIntersect(pool, table, fields, values);
    return result.length > 0;
};

const createNewVehicle = async (info) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const defaultFields = ["mass", "order_ids", "busy"];
    const defaultValues = [0, JSON.stringify([]), false];

    const allFields = [...fields, ...defaultFields];
    const allValues = [...values, ...defaultValues];

    return await dbUtils.insert(pool, table, allFields, allValues);
};

const getManyVehicles = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.find(pool, table, fields, values);
};

const getOneVehicle = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.findOneIntersect(pool, table, fields, values);
};

const getVehicleOrderIds = async (vehicle) => {
    let order_ids = vehicle.order_ids;

    if (!order_ids) {
        return new Array();
    }

    order_ids = JSON.parse(order_ids);

    if (typeof order_ids !== "object") {
        return new Array();
    }

    const result = new Array();

    for (const order_id of order_ids) {
        const order = await Orders.getOneOrder({ order_id: order_id });

        if (order && order.length > 0) {
            result.push(order[0]);
        }
    }

    return result;
}

const updateVehicle = async (info, conditions) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    return await dbUtils.updateOne(pool, table, fields, values, conditionFields, conditionValues);
};

const addOrders = async (vehicle, order_ids) => {
    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();
    let jsonOrderIds;

    if (vehicle.order_ids) {
        const prevOrderIds = JSON.parse(vehicle.order_ids);
        for (let i = 0; i < order_ids.length; i++) {
            if (!prevOrderIds.includes(order_ids[i]) && await increaseMass(vehicle.vehicle_id, order_ids[i])) {
                prevOrderIds.push(order_ids[i]);
                ++acceptedNumber;
                acceptedArray.push(order_ids[i]);
            }
            else {
                ++notAcceptedNumber;
                notAcceptedArray.push(order_ids[i]);
            }
        }

        jsonOrderIds = JSON.stringify(prevOrderIds);
    }
    else {
        jsonOrderIds = JSON.stringify(order_ids);
    }

    const result = await dbUtils.updateOne(pool, table, ["order_ids"], [jsonOrderIds], ["vehicle_id"], [vehicle.vehicle_id]);

    return new Object({
        affectedRows: result ? result.affectedRows : 0,
        acceptedNumber: acceptedNumber,
        acceptedArray: acceptedArray,
        notAcceptedNumber: notAcceptedNumber,
        notAcceptedArray: notAcceptedArray,
    });
}

const deleteOrders = async (vehicle, order_ids) => {
    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();
    let jsonOrderIds;

    if (vehicle.order_ids) {
        const prevOrderIds = JSON.parse(vehicle.order_ids);
        for (let i = 0; i < order_ids.length; i++) {
            const orderIndex = prevOrderIds.indexOf(order_ids[i]);
            if (orderIndex >= 0 && await decreaseMass(vehicle.vehicle_id, order_ids[i])) {
                ++acceptedNumber;
                acceptedArray.push(order_ids[i]);
                prevOrderIds.splice(orderIndex, 1);
            }
            else {
                ++notAcceptedNumber;
                notAcceptedArray.push(order_ids[i]);
            }
        }

        jsonOrderIds = JSON.stringify(prevOrderIds);
    }
    else {
        jsonOrderIds = JSON.stringify(new Array());
    }

    const result = await dbUtils.updateOne(pool, table, ["order_ids"], [jsonOrderIds], ["vehicle_id"], [vehicle.vehicle_id]);

    return new Object({
        affectedRows: result ? result.affectedRows : 0,
        acceptedNumber: acceptedNumber,
        acceptedArray: acceptedArray,
        notAcceptedNumber: notAcceptedNumber,
        notAcceptedArray: notAcceptedArray,
    });
}

const increaseMass = async (vehicle_id, order_id) => {
    const order = await dbUtils.findOneIntersect(pool, "orders", ["order_id"], [order_id]);

    if (!order || order.length <= 0) {
        console.log("Order does not exist.");
        return false;
    }

    const orderMass = order[0].mass ? order[0].mass : 0;

    const vehicleQuery = 'UPDATE ?? SET ?? = ?? + ? WHERE ?? = ?';
    const result = await pool.query(vehicleQuery, ["vehicle", "mass", "mass", orderMass, "vehicle_id", vehicle_id]);

    if (!result || result.length <= 0) {
        console.log("Vehicle does not exist.");
        throw new Error("Phương tiện không tồn tại.");
    }

    return true;
}

const decreaseMass = async (vehicle_id, order_id) => {
    const order = await dbUtils.findOneIntersect(pool, "orders", ["order_id"], [order_id]);

    if (!order || order.length <= 0) {
        console.log("Order does not exist.");
        return false;
    }

    const orderMass = order[0].mass ? order[0].mass : 0;

    const vehicleQuery = 'UPDATE ?? SET ?? = ?? - ? WHERE ?? = ?';
    const result = await pool.query(vehicleQuery, ["vehicle", "mass", "mass", orderMass, "vehicle_id", vehicle_id]);

    if (!result || result.length <= 0) {
        console.log("Vehicle does not exist.");
        throw new Error("Phương tiện không tồn tại.");
    }

    return true;
}

const deleteVehicle = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.deleteOne(pool, table, fields, values);
};

module.exports = {
    checkExistVehicle,
    createNewVehicle,
    getVehicleOrderIds,
    getManyVehicles,
    getOneVehicle,
    updateVehicle,
    addOrders,
    deleteOrders,
    deleteVehicle,
};
