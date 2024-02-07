const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");
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
    return await dbUtils.insert(pool, agencyTable, fields, values);
}

const recieveShipment = async (shipment_id, agency_id) => {

    const agencyOrdersTable = agency_id + "_orders";

    try {
        const getOrderIDsQuery = `SELECT order_ids FROM ${table} WHERE shipment_id = ?`;
        const [rows] = await pool.query(getOrderIDsQuery, shipment_id);

        if (rows.length > 0) {
            const order_ids = JSON.parse(rows[0].order_ids);
            let result;
            for (const order_id of order_ids) {
                const orderData = await getInfoOrder(order_id);
                result = await dbUtils.insert(pool, agencyOrdersTable, orderData.fields, orderData.values);
            }
            return result[0];
        } else {
            console.log("Shipment does not exist");
            throw new Error("Thông tin lô hàng không hợp lệ!");
        }

    } catch (error) {
        console.log("Error: ", error);
        throw new Error(error.message);
    }
}

const addOrderToShipment = async (shipment_id, order_id, agency_id) => {
    const agencyShipmentsTable = agency_id + suffix;
    const agencyOrdersTable = agency_id + "_orders";

    try {
        const getOrderQuery = `SELECT parent, mass FROM ${agencyOrdersTable} WHERE order_id = ? LIMIT 1`;
        const [orderRow] = await pool.query(getOrderQuery, order_id);

        if (!orderRow || orderRow.length <= 0) {
            console.log("Order is not exist");
            throw new Error("Đơn hàng không tồn tại!");
        }

        const { parent: orderParent, mass: orderMass } = orderRow[0];

        if (orderParent !== null && orderParent !== undefined) {
            console.log(orderParent);
            console.log("Order already exist in shipment");
            throw new Error("Đơn hàng đã được quét lên từ trước!");
        }
        //append order_ids, cong mass
        //UPDATE `shipment` SET `order_ids` = JSON_ARRAY_APPEND(COALESCE(order_ids, '[]'), '$', "1");
        const updateShipmentQuery = `
            UPDATE ${agencyShipmentsTable}
            SET 
                order_ids = JSON_ARRAY_APPEND(COALESCE(order_ids, '[]'), '$', ?),
                mass = mass + ?
            WHERE shipment_id = ?
        `;
        const result = await pool.query(updateShipmentQuery,[order_id, orderMass, shipment_id]);

        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error(error.message);
    }
}

const deleteOrderFromShipment = async (shipment_id, order_id, agency_id) => {
    const agencyShipmentsTable = agency_id + suffix;
    const agencyOrdersTable = agency_id + "_orders";

    try {
        
        const getOrderQuery = `SELECT mass FROM ${agencyOrdersTable} WHERE order_id = ?`;
        const [orderRow] = await pool.query(getOrderQuery, order_id);

        if (!orderRow || orderRow.length <= 0) {
            console.log("Order is not exist");
            throw new Error("Đơn hàng không tồn tại!");
        }

        const { mass: orderMass } = orderRow[0];

        const getBucketQuery = `SELECT order_ids FROM ${agencyShipmentsTable} WHERE shipment_id = ?`;
        const [bucket] = await pool.query(getBucketQuery, shipment_id);

        if (bucket.length > 0) {
            const ordersFromDatabase = JSON.parse(bucket[0].order_ids);
            const setFromDatabase = new Set(ordersFromDatabase);
            console.log(setFromDatabase);
            

            if(!setFromDatabase.has(order_id)) {
                console.log("Order is not contained in shipment!");
                throw new Error("Đơn hàng không tồn tại trong lô hàng!");
            }
            
        } else {
            console.log("Shipment does not exist");
            throw new Error("Thông tin lô hàng không hợp lệ!");
        } 
        
        // UPDATE `shipment`
        // SET order_ids = JSON_REMOVE(order_ids, JSON_UNQUOTE(JSON_SEARCH(order_ids, 'one', '2')))
        // WHERE shipment_id = 'TD20240423370236';

        const updateShipmentQuery = `
                UPDATE ${agencyShipmentsTable}
                SET 
                    order_ids = JSON_REMOVE(order_ids, JSON_UNQUOTE(JSON_SEARCH(order_ids, 'one', ?))),
                    mass = mass - ?
                WHERE shipment_id = ?;
        `;

        const result = await pool.query(updateShipmentQuery, [order_id, orderMass, shipment_id]);
        const updateOrderQuery = `UPDATE ${agencyOrdersTable} SET parent = null WHERE order_id = ?`;
        await pool.query(updateOrderQuery, order_id);
        return result;
        
    } catch (error) {
        console.log("Error: ", error);
        throw new Error(error.message);
    }
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

const deleteGlobalShipment = async (shipment_id) => {
    return await dbUtils.deleteOne(pool, table, ["shipment_id"], [shipment_id]);
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

const getInfoOrder = async (order_id) => {
    try {
        console.log(order_id);
        const ordersTable = "orders";
        const query = `SELECT * FROM ${ordersTable} WHERE order_id = ?`;
        const [rows] = await pool.query(query, order_id);
        console.log(rows);
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

const updateParentForGlobalOrders = async (shipment_id, agency_id) => {
    const agencyShipmentsTable = agency_id + suffix;
    const agencyOrdersTable = agency_id + "_orders";
    const result = await dbUtils.findOne(pool, agencyShipmentsTable, ["shipment_id"], [shipment_id]);

    if (!result || result[0].length <= 0) {
        console.log("Shipment does not exist.");
        throw new Error("Lô hàng không tồn tại.");
    }

    const order_ids = JSON.parse(result.order_ids);

    for (const order_id of order_ids) {
        const localUpdatingResult = await dbUtils.updateOne(pool, agencyOrdersTable, ["parent"], [shipment_id], ["order_id"], [order_id]);
        
        if (!localUpdatingResult || localUpdatingResult.length <= 0) {
            console.log("Order does not exist in agency.");
            throw new Error("Đơn hàng không tồn tại trong cơ sở dữ liệu của bưu cục.");
        }

        const globalUpdatingResult = await dbUtils.updateOne(pool, "orders", ["parent"], [shipment_id], ["order_id"], [order_id]);

        if (!globalUpdatingResult || globalUpdatingResult.length <= 0) {
            console.log("Order does not exist in global.");
            throw new Error("Đơn hàng không tồn tại trên hệ thống tổng cục.");
        }
    }
}

const confirmCreateShipment = async (fields, values) => {
    return await dbUtils.insert(pool, table, fields, values);
}

const updateShipmentToDatabase = async (fields, values, shipment_id) => {
    const conditionFields = ["shipment_id"];
    const conditionValues = [shipment_id];
    return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
} 

const updateOrderToDatabase = async (fields, values, order_id) => {
    const conditionFields = ["order_id"];
    const conditionValues = [order_id];
    return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
}

const compareOrdersInDatabase = async (shipment_id, ordersFromRequest, agency_id) => {
    const agencyShipmentsTable = agency_id + suffix;
    const agencyOrdersTable = agency_id + "_orders";

    try{
        //console.log(agencyShipmentsTable);
        const getOrderIDsQuery = `SELECT order_ids FROM ${agencyShipmentsTable} WHERE shipment_id = ?`;
        const [rows] = await pool.query(getOrderIDsQuery, shipment_id);
        if (rows.length > 0) {
            const ordersFromDatabase = JSON.parse(rows[0].order_ids);
            console.log(ordersFromDatabase);

            const setFromDatabase = new Set(ordersFromDatabase);
            const setFromRequest = new Set(ordersFromRequest);

            const setEqual =    (setFromDatabase.length === setFromRequest.length) &&
                                (ordersFromDatabase.every(value => setFromRequest.has(value))) &&
                                (ordersFromRequest.every(value => setFromDatabase.has(value)));
            
            if (setEqual) {
                return { error: false, message: "Tất cả đơn hàng trùng khớp trên hệ thống." };
            } else {
                return { error: true, message: "Tồn tại đơn hàng không trùng khớp trên hệ thống." };
            }
        } else {
            console.log("Shipment does not exist");
            throw new Error("Thông tin lô hàng không hợp lệ!");
        } 
    } catch (error) {
        console.log("Error: ", error);
        throw new Error(error.message);
    } 
}

const decomposeShipment = async (shipment_id, order_ids , agency_id) => {
    const agencyShipmentsTable = agency_id + suffix;
    const agencyOrdersTable = agency_id + "_orders";
    
    try {
        const compareOrders = await compareOrdersInDatabase(shipment_id, order_ids, agency_id);
        const { error, message } = compareOrders;    
        
        if (error) {
            console.log(message);
            throw new Error(message);
        }
        
        for (const order_id of order_ids) {
            const ordersQuery = `UPDATE ${agencyOrdersTable} SET parent = null WHERE order_id = ?`;
            await pool.query(ordersQuery, [order_id]);
        }

        const shipmentsQuery = `UPDATE ${agencyShipmentsTable} SET status = 1 WHERE shipment_id = ? `;
        return await pool.query(shipmentsQuery, [shipment_id]);
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
}

module.exports = {
    createNewShipment,
    updateParentForGlobalOrders,
    confirmCreateShipment,
    getDataForShipmentCode,
    updateShipment,
    getInfoShipment,
    recieveShipment,
    addOrderToShipment,
    deleteOrderFromShipment,
    updateOrderToDatabase,
    recieveShipment,
    addOrderToShipment,
    deleteOrderFromShipment,
    updateOrderToDatabase,
    getShipmentForAdmin,
    getShipmentForAgency,
    decomposeShipment,
    updateShipmentToDatabase,
    deleteShipment,
    deleteGlobalShipment,
};