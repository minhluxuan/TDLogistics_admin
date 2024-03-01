const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");
const Orders = require("./Orders");
const { setStatusToOrder } = require("./Orders");
const servicesStatus = require("../lib/servicesStatus");

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

    const defaultFields = ["mass", "shipment_ids", "busy"];
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

// const addOrders = async (vehicle, order_ids) => {
//     let acceptedNumber = 0;
//     const acceptedArray = new Array();
//     let notAcceptedNumber = 0;
//     const notAcceptedArray = new Array();
//     let jsonOrderIds;

//     if (vehicle.order_ids) {
//         const prevOrderIds = JSON.parse(vehicle.order_ids);
//         for (let i = 0; i < order_ids.length; i++) {
//             if (!prevOrderIds.includes(order_ids[i]) && await increaseMass(vehicle.vehicle_id, order_ids[i])) {
//                 prevOrderIds.push(order_ids[i]);
//                 ++acceptedNumber;
//                 acceptedArray.push(order_ids[i]);
//             }
//             else {
//                 ++notAcceptedNumber;
//                 notAcceptedArray.push(order_ids[i]);
//             }
//         }

//         jsonOrderIds = JSON.stringify(prevOrderIds);
//     }
//     else {
//         jsonOrderIds = JSON.stringify(order_ids);
//     }

//     const result = await dbUtils.updateOne(pool, table, ["order_ids"], [jsonOrderIds], ["vehicle_id"], [vehicle.vehicle_id]);

//     return new Object({
//         affectedRows: result ? result.affectedRows : 0,
//         acceptedNumber: acceptedNumber,
//         acceptedArray: acceptedArray,
//         notAcceptedNumber: notAcceptedNumber,
//         notAcceptedArray: notAcceptedArray,
//     });
// }

// const deleteOrders = async (vehicle, order_ids) => {
//     let acceptedNumber = 0;
//     const acceptedArray = new Array();
//     let notAcceptedNumber = 0;
//     const notAcceptedArray = new Array();
//     let jsonOrderIds;

//     if (vehicle.order_ids) {
//         const prevOrderIds = JSON.parse(vehicle.order_ids);
//         for (let i = 0; i < order_ids.length; i++) {
//             const orderIndex = prevOrderIds.indexOf(order_ids[i]);
//             if (orderIndex >= 0 && await decreaseMass(vehicle.vehicle_id, order_ids[i])) {
//                 ++acceptedNumber;
//                 acceptedArray.push(order_ids[i]);
//                 prevOrderIds.splice(orderIndex, 1);
//             }
//             else {
//                 ++notAcceptedNumber;
//                 notAcceptedArray.push(order_ids[i]);
//             }
//         }

//         jsonOrderIds = JSON.stringify(prevOrderIds);
//     }
//     else {
//         jsonOrderIds = JSON.stringify(new Array());
//     }

//     const result = await dbUtils.updateOne(pool, table, ["order_ids"], [jsonOrderIds], ["vehicle_id"], [vehicle.vehicle_id]);

//     return new Object({
//         affectedRows: result ? result.affectedRows : 0,
//         acceptedNumber: acceptedNumber,
//         acceptedArray: acceptedArray,
//         notAcceptedNumber: notAcceptedNumber,
//         notAcceptedArray: notAcceptedArray,
//     });
// }

// const increaseMass = async (vehicle_id, order_id) => {
//     const order = await dbUtils.findOneIntersect(pool, "orders", ["order_id"], [order_id]);

//     if (!order || order.length <= 0) {
//         console.log("Order does not exist.");
//         return false;
//     }

//     const orderMass = order[0].mass ? order[0].mass : 0;

//     const vehicleQuery = 'UPDATE ?? SET ?? = ?? + ? WHERE ?? = ?';
//     const result = await pool.query(vehicleQuery, ["vehicle", "mass", "mass", orderMass, "vehicle_id", vehicle_id]);

//     if (!result || result.length <= 0) {
//         console.log("Vehicle does not exist.");
//         throw new Error("Phương tiện không tồn tại.");
//     }

//     return true;
// }

const deleteVehicle = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.deleteOne(pool, table, fields, values);
};

const addShipmentToVehicle = async (vehicle, shipment_ids) => {
    const acceptedArray = new Array();
    const missingShipmentArray = new Array();
    const overloadShipmentArray = new Array();
   
    let currentMass = vehicle.mass;
    const prevShipmentIds = JSON.parse(vehicle.shipment_ids);


    for (let i = 0; i < shipment_ids.length; i++) {
        const getShipmentQuery = `SELECT mass, order_ids FROM shipment WHERE shipment_id = ?`;
        const [shipmentRow] = await pool.query(getShipmentQuery, [shipment_ids[i]]);
        const shipmentMass  = shipmentRow[0].mass;
    
        if (prevShipmentIds.includes(shipment_ids[i])) { 
            missingShipmentArray.push(shipment_ids[i]);
        }
        else if(shipmentMass + currentMass > vehicle.max_load) {
            overloadShipmentArray.push(shipment_ids[i]);
        }
        else {
            prevShipmentIds.push(shipment_ids[i]);
            currentMass = currentMass + shipmentMass;
            acceptedArray.push(shipment_ids[i]);
            const order_ids = JSON.parse(shipmentRow[0].order_ids);
            for (const order_id of order_ids) {
                const orderInfo = new Object({
                    order_id: order_id,
                    // shipment_id: shipment_ids[i],
                    // managed_by: vehicle.vehicle_id
                });
                await setStatusToOrder(orderInfo, servicesStatus.leave_agency, false);
            }
        }
    }

    const jsonShipmentIds = JSON.stringify(prevShipmentIds);
    const result = await dbUtils.updateOne(pool, table, ["shipment_ids", "mass"], [jsonShipmentIds, currentMass], ["vehicle_id"], [vehicle.vehicle_id]);

    return new Object({
        affectedRows: result ? result.affectedRows : 0,
        acceptedNumber: acceptedArray.length,
        acceptedArray: acceptedArray,
        missingShipmentNumber: missingShipmentArray.length,
        missingShipmentArray: missingShipmentArray,
        overloadShipmentNumber: overloadShipmentArray.length,
        overloadShipmentArray: overloadShipmentArray,
        ShipmentIDs: jsonShipmentIds
    });
    
}

const deleteShipmentFromVehicle = async (vehicle, shipment_ids) => {
    const acceptedArray = new Array();
    const missingShipmentArray = new Array();
   
    let currentMass = vehicle.mass;
    const prevShipmentIds = JSON.parse(vehicle.shipment_ids);
    for (let i = 0; i < shipment_ids.length; i++) {
        const getShipmentQuery = `SELECT mass FROM shipment WHERE shipment_id = ?`;
        const [shipmentRow] = await pool.query(getShipmentQuery, [shipment_ids[i]]);
        const { mass: shipmentMass } = shipmentRow[0];

        if (!prevShipmentIds.includes(shipment_ids[i]) && (currentMass - shipmentMass >= 0)) {
            const shipmentIndex = prevShipmentIds.indexOf(shipment_ids[i]);
            prevShipmentIds.splice(shipmentIndex, 1);
            currentMass = currentMass - shipmentMass;
            acceptedArray.push(shipment_ids[i]);
        }
        else {
            missingShipmentArray.push(shipment_ids[i]);
        }
    }

    const jsonShipmentIds = JSON.stringify(prevShipmentIds);
    const result = await dbUtils.updateOne(pool, table, ["shipment_ids", "mass"], [jsonShipmentIds, currentMass], ["vehicle_id"], [vehicle.vehicle_id]);

    return new Object({
        affectedRows: result ? result.affectedRows : 0,
        acceptedNumber: acceptedArray.length,
        acceptedArray: acceptedArray,
        missingShipmentNumber: missingShipmentArray.length,
        missingShipmentArray: missingShipmentArray,
        ShipmentIDs: jsonShipmentIds
    });
}

module.exports = {
    checkExistVehicle,
    createNewVehicle,
    getVehicleOrderIds,
    getManyVehicles,
    getOneVehicle,
    updateVehicle,
    // addOrders,
    // deleteOrders,
    deleteVehicle,
    addShipmentToVehicle,
    deleteShipmentFromVehicle,
};
