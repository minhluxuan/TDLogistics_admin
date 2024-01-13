const mysql = require("mysql2");
const moment = require("moment");
const utils = require("./utils");
require("dotenv").config();


const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

const table = "shipment";
const pool = mysql.createPool(dbOptions).promise();

const getDataForShipmentCode = async (staff_id, transport_partner_id = null) => {
    const staffTable = "staff";
    const transportPartnerTable = "transport_partner";
    const vehicleTable = "vehicle";
    

    if(transport_partner_id !== null) {
        const transportPartnerQuery = `SELECT name FROM ${transportPartnerTable} WHERE transport_partner_id = ?`;
        const vehicleQuery = `SELECT vehicle_id FROM ${vehicleTable} WHERE transport_partner_id = ?`;
        const [transportPartnerResult] = await pool.query(transportPartnerQuery, transport_partner_id);
        const [vehicleResult] = await pool.query(vehicleQuery, transport_partner_id);
        const result = {
            partnerName: transportPartnerResult[0].name,
            VehicleID: vehicleResult[0].vehicle_id,
        }
        return result;
    }
    else {
        const staffQuery = `SELECT fullname FROM ${staffTable} WHERE staff_id = ?`;
        const transportPartnerQuery = `SELECT vehicle_id FROM ${vehicleTable} WHERE staff_id = ?`;
        const [staffResult] = await pool.query(staffQuery, staff_id);
        const [transportPartnerResult] = await pool.query(transportPartnerQuery, staff_id);
        const result = {
            fullname: staffResult[0].fullname,
            VehicleID: transportPartnerResult[0].vehicle_id,
        }
        return result;
    }
}

const createNewShipment = async (fields, values) => {
    console.log(fields);
    return await utils.insert(pool, table, fields, values);
}

// const updateShipment = async (order_ids, shipment_id) => {
    
//     const ordersTable = "orders";
//     const currentTime = new Date();
//     const formattedTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
//     const statusMessage = "Đóng lô thành công!";

//     for (const order_id of order_ids) { 
//         //append to Journey and update parent of orders
//         const updateJourneyQuery = `
//             UPDATE ${ordersTable}
//             SET 
//                 journey = JSON_ARRAY_APPEND(
//                     COALESCE(journey, '[]'),
//                     '$',
//                     JSON_OBJECT(
//                         'shipment_id', ?,
//                         'status', ?,
//                         'date', ?
//                     )
//                 ),
//                 parent = ?
//             WHERE order_id = ?
//         `;

//         await pool.query(updateJourneyQuery, [shipment_id, statusMessage, formattedTime, shipment_id, order_id]);

//         //update shipment
//         const updateShipmentQuery = `
//             UPDATE ${table}
//             SET mass = mass + (
//                 SELECT mass
//                 FROM ${ordersTable}
//                 WHERE order_id = ?
//             )
//             WHERE shipment_id = ?
//         `;

//         await pool.query(updateShipmentQuery, [order_id, shipment_id]);
//     }   
// }

const updateShipment = async (fields, values, conditionFields, conditionValues) => {
    const setClause = `${fields} = ${fields} + ?`;
    const whereClause = `${conditionFields} = ?`;

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    const result = await pool.query(query, [values, conditionValues]);
    return result[0];
};

const getShipment = async (fields, values) => {
    //get all the order_id that have parent is shipment_id
    const ordersTable = "orders";
    const getShipmentQuery = `SELECT order_id FROM ${ordersTable} WHERE ${fields} = ?`;
    const [rows] = await pool.query(getShipmentQuery, [values]);
    const result = rows.map(row => row.order_id);
    return result;
}

module.exports = {
    createNewShipment,
    getDataForShipmentCode,
    updateShipment,
    getShipment,
};