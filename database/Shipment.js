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
const dbOptionsAgency = {
    host: process.env.HOST,
    port: process.env.DBPOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.AGENCYDATABASE,
}

const table = "shipment";
const pool = mysql.createPool(dbOptions).promise();
const agencyPool = mysql.createPool(dbOptionsAgency).promise();

const getDataForShipmentCode = async (staff_id, transport_partner_id = null) => {
    try {
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
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    } 
    
}

const createNewShipment = async (fields, values) => {
    console.log(fields);
    return await utils.insert(agencyPool, table, fields, values);
}


//trường hợp thêm vào nếu thêm trên database tổng bị lỗi thì nhân viên bưu cục tự xóa trong db bưu cục
//nếu xóa ở createShipment thất bại
const deleteShipment = async (shipment_id) => {
    const field = "shipment_id";
    const query = `DELETE FROM ${table} WHERE ${field} = ? LIMIT 1`;
    try {
        const result = await agencyPool.query(query, shipment_id);
        console.log("Success!");
        return result;
    } 
    catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi xóa lô hàng. Vui lòng thử lại sau ít phút!");
    }
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
    try {
        const setClause = `${fields} = ${fields} + ?`;
        const whereClause = `${conditionFields} = ?`;

        const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

        const result = await agencyPool.query(query, [values, conditionValues]);
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
    
};

const getShipmentForAgency = async (fields, values) => {
    try {
        //get all the order_id that have parent is shipment_id
        const ordersTable = "orders";
        const getShipmentQuery = `SELECT order_id FROM ${ordersTable} WHERE ${fields} = ?`;
        const [rows] = await agencyPool.query(getShipmentQuery, [values]);
        const result = rows.map(row => row.order_id);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
}

const getShipmentForAdmin = async (fields, values) => {
    try {
        //get all the order_id that have parent is shipment_id
        const ordersTable = "orders";
        const getShipmentQuery = `SELECT order_id FROM ${ordersTable} WHERE ${fields} = ?`;
        const [rows] = await pool.query(getShipmentQuery, [values]);
        const result = rows.map(row => row.order_id);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
}

const getInfoShipment = async (shipment_id) => {
    try {
        const query = `SELECT * FROM ${table} WHERE shipment_id = ?`;
        const [rows] = await agencyPool.query(query, shipment_id);
        if (rows.length > 0) {
            const result = rows[0];

            console.log('Fields:', Object.keys(result));
            console.log('Values:', Object.values(result));

            return { fields: Object.keys(result), values: Object.values(result) };
        }
        else {
            throw new Error("Thông tin không hợp lệ!");
        }
    }
    catch (error) {
        console.log("Error: ", error);
        throw error;
    }
}

const confirmCreateShipment = async (fields, values) => {
    console.log(fields);
    return await utils.insert(pool, table, fields, values);
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    const conditionFields = ["shipment_id"];
    const conditionValues = [shipment_id];
    return await utils.update(pool, table, fields, values, conditionFields, conditionValues);
} 


const decompseShipment = async (shipment_id) => {
    try {
        const field = "status";
        const conditionField = "shipment_id";
        const query = `UPDATE ${table} SET ${field} = 1 WHERE ${conditionField} = ? `;
        return await agencyPool.query(query, [shipment_id]);
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
}

module.exports = {
    createNewShipment,
    confirmCreateShipment,
    getDataForShipmentCode,
    updateShipment,
    getInfoShipment,
    getShipmentForAdmin,
    getShipmentForAgency,
    decompseShipment,
    updateShipmentToDatabase,
    deleteShipment,
};