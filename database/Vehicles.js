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

const checkExistVehicle = async (field, value) => {
    const result = await dbUtils.findOne(pool, table, field, value);
    return result.length > 0;
};

const createNewVehicle = async (fields, values) => {
    const lastVehicle = await dbUtils.getLastRow(pool, table);

	let vehicleId = "0000000";

	if (lastVehicle) {
		vehicleId = (parseInt(lastVehicle["vehicle_id"]) + 1).toString().padStart(7, "0");
	}


    const defaultFields = ["vehicle_id", "mass", "order_ids", "busy"];
    const defaultValues = [vehicleId, 0, JSON.stringify([]), false];
    const allFields = [...fields, ...defaultFields];
    const allValues = [...values, ...defaultValues];
    return await dbUtils.insert(pool, table, allFields, allValues);
};

const getManyVehicles = async (fields, values) => {
    return await dbUtils.find(pool, table, fields, values);
};

const getOneVehicle = async (fields, values) => {
    return await dbUtils.findOne(pool, table, fields, values);
};

const getVehicleOrderIds = async (fields, values) => {
    const vehicle = await getOneVehicle(fields, values);

    if (!vehicle || vehicle.length <= 0) {
        throw new Error("Phương tiện không tồn tại.");
    }

    let order_ids = vehicle[0].order_ids;

    if (!order_ids) {
        return new Array();
    }

    order_ids = JSON.parse(order_ids);

    if (typeof order_ids !== "object") {
        return new Array();
    }

    const result = new Array();

    for (const order_id of order_ids) {
        const order = await Orders.getOneOrder(["order_id"], [order_id]);

        if (order && order.length > 0) {
            result.push(order[0]);
        }
    }

    return result;
}

const updateVehicle = async (fields, values, conditionFields, conditionValues) => {
    return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

const addOrders = async (vehicle_id, order_ids) => {
    try {
        const vehicle = await dbUtils.findOne(pool, table, ["vehicle_id"], [vehicle_id]);

        if (!vehicle || vehicle.length <= 0) {
            console.log("Vehicle does not exist.");
            throw new Error("Phương tiện không tồn tại.");
        }

        let acceptedNumber = 0;
        const acceptedArray = new Array();
        let notAcceptedNumber = 0;
        const notAcceptedArray = new Array();
        let jsonOrderIds;

        if (vehicle[0].order_ids) {
            const prevOrderIds = JSON.parse(vehicle[0].order_ids);
            for (let i = 0; i < order_ids.length; i++) {
                if (!prevOrderIds.includes(order_ids[i]) && await increaseMass(vehicle_id, order_ids[i])) {
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

        const result = await dbUtils.updateOne(pool, table, ["order_ids"], [jsonOrderIds], ["vehicle_id"], [vehicle_id]);

        return new Object({
            affectedRows: result ? result.affectedRows : 0,
            acceptedNumber: acceptedNumber,
            acceptedArray: acceptedArray,
            notAcceptedNumber: notAcceptedNumber,
            notAcceptedArray: notAcceptedArray,
        });
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

const deleteOrders = async (vehicle_id, order_ids) => {
    try {
        const vehicle = await dbUtils.findOne(pool, table, ["vehicle_id"], [vehicle_id]);

        if (!vehicle || vehicle.length <= 0) {
            console.log("Vehicle does not exist.");
            throw new Error("Phương tiện không tồn tại.");
        }

        let acceptedNumber = 0;
        const acceptedArray = new Array();
        let notAcceptedNumber = 0;
        const notAcceptedArray = new Array();
        let jsonOrderIds;

        if (vehicle[0].order_ids) {
            const prevOrderIds = JSON.parse(vehicle[0].order_ids);
            for (let i = 0; i < prevOrderIds.length; i++) {
                if (order_ids.includes(prevOrderIds[i]) && await decreaseMass(vehicle_id, prevOrderIds[i])) {
                    ++acceptedNumber;
                    acceptedArray.push(prevOrderIds[i]);
                    prevOrderIds.splice(i, 1);
                    --i;
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

        const result = await dbUtils.updateOne(pool, table, ["order_ids"], [jsonOrderIds], ["vehicle_id"], [vehicle_id]);

        return new Object({
            affectedRows: result ? result.affectedRows : 0,
            acceptedNumber: acceptedNumber,
            acceptedArray: acceptedArray,
            notAcceptedNumber: notAcceptedNumber,
            notAcceptedArray: notAcceptedArray,
        });
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

const increaseMass = async (vehicle_id, order_id) => {
    const order = await dbUtils.findOne(pool, "orders", ["order_id"], [order_id]);

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
    const order = await dbUtils.findOne(pool, "orders", ["order_id"], [order_id]);

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

const deleteVehicle = async (fields, values) => {
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
