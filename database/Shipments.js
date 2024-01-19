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
const suffix = "_" + table;

const pool = mysql.createPool(dbOptions).promise();

const getDataForShipmentCode = async (staff_id, transport_partner_id = null) => {
    try {
        const staffTable = "staff";
        const transportPartnerTable = "transport_partner";
        const vehicleTable = "vehicle";
        
        if(transport_partner_id !== null) {
            const transportPartnerQuery = `SELECT name FROM ${transportPartnerTable} WHERE transport_partner_id = ? LIMIT 1`;
            const vehicleQuery = `SELECT vehicle_id FROM ${vehicleTable} WHERE staff_id = ? LIMIT 1`;
            const [transportPartnerResult] = await pool.query(transportPartnerQuery, transport_partner_id);
            const [vehicleResult] = await pool.query(vehicleQuery, staff_id);

            if (!transportPartnerResult || transportPartnerResult.length <= 0) {
                console.log("Transport partner does not exist.");
                throw new Error("Đối tác vận tải không tồn tại.");
            }

            if (!vehicleResult || vehicleResult.length <= 0) {
                console.log("Vehicle does not exist.");
                throw new Error("Phương tiện không tồn tại.");
            }

            const result = {
                partnerName: transportPartnerResult[0].name,
                vehicleID: vehicleResult[0].vehicle_id,
            }

            return result;
        }
        else {
            const staffQuery = `SELECT fullname FROM ${staffTable} WHERE staff_id = ?`;
            const transportPartnerQuery = `SELECT vehicle_id FROM ${vehicleTable} WHERE staff_id = ?`;
            const [staffResult] = await pool.query(staffQuery, staff_id);
            const [transportPartnerResult] = await pool.query(transportPartnerQuery, staff_id);

            if (!transportPartnerResult || transportPartnerResult.length <= 0) {
                console.log("Transport partner does not exist.");
                throw new Error("Đối tác vận tải không tồn tại.");
            }

            if (!staffResult || staffResult.length <= 0) {
                console.log("Staff does not exist.");
                throw new Error("Nhân viên không tồn tại.");
            }

            const result = {
                fullname: staffResult[0].fullname,
                vehicleID: transportPartnerResult[0].vehicle_id,
            }

            return result;
        }
    } catch (error) {
        console.log("Error: ", error);
        throw new Error(error.message);
    } 
    
}

const createNewShipment = async (fields, values, agency_id) => {
    const agencyTable = agency_id + suffix;
    return await utils.insert(pool, agencyTable, fields, values);
}


//trường hợp thêm vào nếu thêm trên database tổng bị lỗi thì nhân viên bưu cục tự xóa trong db bưu cục
//nếu xóa ở createShipment thất bại
const deleteShipment = async (shipment_id, agency_id) => {
    const agencyTable = agency_id + suffix;
    const field = "shipment_id";
    const query = `DELETE FROM ${agencyTable} WHERE ${field} = ? LIMIT 1`;
    try {
        const result = await pool.query(query, shipment_id);
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

const updateShipment = async (fields, values, conditionFields, conditionValues, agency_id) => {
    try {
        const agencyTable = agency_id + suffix;
        const setClause = `${fields} = ${fields} + ?`;
        const whereClause = `${conditionFields} = ?`;
        const query = `UPDATE ${agencyTable} SET ${setClause} WHERE ${whereClause}`;

        const result = await pool.query(query, [values, conditionValues]);
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
    
};

const getShipmentForAgency = async (fields, values, agency_id) => {
    try {
        //get all the order_id that have parent is shipment_id
        const ordersTable = agency_id + "_orders";
        const getShipmentQuery = `SELECT order_id FROM ${ordersTable} WHERE ${fields} = ?`;
        const [rows] = await pool.query(getShipmentQuery, [values]);
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

const getInfoShipment = async (shipment_id, agency_id) => {
    try {
        const agencyTable = agency_id + suffix;
        const query = `SELECT * FROM ${agencyTable} WHERE shipment_id = ?`;
        const [rows] = await pool.query(query, shipment_id);
        if (rows.length > 0) {
            const result = rows[0];
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
    return await utils.insert(pool, table, fields, values);
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    const conditionFields = ["shipment_id"];
    const conditionValues = [shipment_id];
    return await utils.update(pool, table, fields, values, conditionFields, conditionValues);
} 


const decompseShipment = async (shipment_id, agency_id) => {
    try {
        const agencyTable = agency_id + suffix;
        const field = "status";
        const conditionField = "shipment_id";
        const query = `UPDATE ${agencyTable} SET ${field} = 1 WHERE ${conditionField} = ? `;
        return await pool.query(query, [shipment_id]);
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