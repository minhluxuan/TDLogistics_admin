const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");
const Shipments = require("./Shipments");
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

const getManyVehicles = async (conditions, paginationConditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const limit = paginationConditions.rows || 0;
    const offset = paginationConditions.page ? paginationConditions.page * limit : 0;

    let query;
    if (fields && values && fields.length > 0 && values.length > 0) {
        query = `SELECT v.transport_partner_id, v.agency_id, v.staff_id, v.vehicle_id, v.type, v.license_plate, 
                v.max_load, v.mass, v.busy, v.created_at, v.last_update, a.agency_name, t.transport_partner_name, p.fullname 
                FROM vehicle AS v
                LEFT JOIN agency AS a ON v.agency_id = a.agency_id 
                LEFT JOIN transport_partner AS t ON v.transport_partner_id = t.transport_partner_id
                LEFT JOIN partner_staff AS p ON v.staff_id = p.staff_id
                WHERE v.transport_partner_id IS NOT NULL AND v.transport_partner_id != "" AND ${fields.map(field => `${field} = ?`).join(" AND ")}
                
                UNION
                
                SELECT v.transport_partner_id, v.agency_id, v.staff_id, v.vehicle_id, v.type, v.license_plate, 
                v.max_load, v.mass, v.busy, v.created_at, v.last_update, a.agency_name, NULL AS transport_partner_name, s.fullname 
                FROM vehicle AS v 
                LEFT JOIN agency AS a ON v.agency_id = a.agency_id 
                LEFT JOIN staff AS s ON v.staff_id = s.staff_id 
                WHERE v.transport_partner_id IS NULL OR v.transport_partner_id = "" AND ${fields.map(field => `${field} = ?`).join(" AND ")};`;
    
                if (offset && typeof offset === "number") {
                    if (limit && typeof limit === "number" && limit > 0) {
                        query += ` LIMIT ?, ?`;
                        values.push(offset, limit);
                    }
                }
                else {
                    if (limit && typeof limit === "number" && limit > 0) {
                        query += ` LIMIT ?`;
                        values.push(limit);
                    }
                }
            }
    else {
        query = `SELECT v.transport_partner_id, v.agency_id, v.staff_id, v.vehicle_id, v.type, v.license_plate, 
                v.max_load, v.mass, v.busy, v.created_at, v.last_update, a.agency_name, t.transport_partner_name, p.fullname 
                FROM vehicle AS v 
                LEFT JOIN agency AS a ON v.agency_id = a.agency_id 
                LEFT JOIN transport_partner AS t ON v.transport_partner_id = t.transport_partner_id
                LEFT JOIN partner_staff AS p ON v.staff_id = p.staff_id
                WHERE v.transport_partner_id IS NOT NULL AND v.transport_partner_id != ""
                
                UNION
                
                SELECT v.transport_partner_id, v.agency_id, v.staff_id, v.vehicle_id, v.type, v.license_plate, 
                v.max_load, v.mass, v.busy, v.created_at, v.last_update, a.agency_name, NULL AS transport_partner_name, s.fullname 
                FROM vehicle AS v 
                LEFT JOIN agency AS a ON v.agency_id = a.agency_id 
                LEFT JOIN staff AS s ON v.staff_id = s.staff_id 
                WHERE v.transport_partner_id IS NULL OR v.transport_partner_id = "";`;

                if (offset && typeof offset === "number") {
                    if (limit && typeof limit === "number" && limit > 0) {
                        query += ` LIMIT ?, ?`;
                        values.push(offset, limit);
                    }
                }
                else {
                    if (limit && typeof limit === "number" && limit > 0) {
                        query += ` LIMIT ?`;
                        values.push(limit);
                    }
                }
    }

    return (await pool.query(query, [...values, ...values]))[0];
};

const getOneVehicle = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.findOneIntersect(pool, table, fields, values);
};

const getVehicleShipmentIds = async (vehicle) => {
    let shipment_ids = vehicle.shipment_ids;

    if (!shipment_ids) {
        return new Array();
    }

    shipment_ids = JSON.parse(shipment_ids);

    if (typeof shipment_ids !== "object") {
        return new Array();
    }

    const result = new Array();

    for (const shipment_id of shipment_ids) {
        const shipment = await Shipments.getOneShipment({ shipment_id });

        if (shipment && shipment.length > 0) {
            result.push(shipment[0]);
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

const deleteVehicle = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.deleteOne(pool, table, fields, values);
};

const addShipmentToVehicle = async (vehicle, shipment_ids) => {
    const acceptedArray = new Array();
    const notAcceptedArray = new Array();
    const overloadArray = new Array();
   
    let currentMass = vehicle.mass;
    const prevShipmentIds = JSON.parse(vehicle.shipment_ids);

    for (let i = 0; i < shipment_ids.length; i++) {
        const getShipmentQuery = `SELECT mass, order_ids FROM shipment WHERE shipment_id = ?`;
        const [shipmentRow] = await pool.query(getShipmentQuery, [shipment_ids[i]]);
        const shipmentMass  = shipmentRow[0].mass;
    
        if (prevShipmentIds.includes(shipment_ids[i])) { 
            notAcceptedArray.push(shipment_ids[i]);
        }
        else if(shipmentMass + currentMass > vehicle.max_load) {
            overloadArray.push(shipment_ids[i]);
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
        notAcceptedNumber: notAcceptedArray.length,
        notAcceptedArray: notAcceptedArray,
        overloadShipmentNumber: overloadShipmentArray.length,
        overloadShipmentArray: overloadShipmentArray,
        ShipmentIDs: jsonShipmentIds
    });
}

const deleteShipmentFromVehicle = async (vehicle, shipment_ids) => {
    const acceptedArray = new Array();
    const notAcceptedArray = new Array();
   
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
            notAcceptedArray.push(shipment_ids[i]);
        }
    }

    const jsonShipmentIds = JSON.stringify(prevShipmentIds);
    const result = await dbUtils.updateOne(pool, table, ["shipment_ids", "mass"], [jsonShipmentIds, currentMass], ["vehicle_id"], [vehicle.vehicle_id]);

    return new Object({
        affectedRows: result ? result.affectedRows : 0,
        acceptedNumber: acceptedArray.length,
        acceptedArray: acceptedArray,
        notAcceptedNumber: notAcceptedArray.length,
        notAcceptedArray: notAcceptedArray,
        ShipmentIDs: jsonShipmentIds
    });
}

module.exports = {
    checkExistVehicle,
    createNewVehicle,
    getManyVehicles,
    getOneVehicle,
    updateVehicle,
    deleteVehicle,
    addShipmentToVehicle,
    deleteShipmentFromVehicle,
};
