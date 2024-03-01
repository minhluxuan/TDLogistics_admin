const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");
const utils = require("../lib/utils");
const { setStatusToOrder } = require("./Orders");
const servicesStatus = require("../lib/servicesStatus");
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

const checkExistShipment = async (shipment_id, agency_id) => {
    const postal_code = utils.getPostalCodeFromAgencyID(agency_id);
    const agencyShipmentTable = postal_code + "_shipment";
    
    // const getShipmentInAgencyQuery = `SELECT * FROM ${agencyShipmentTable} WHERE shipment_id = ?`;
    const getShipmentInAgencyResult = await dbUtils.findOneIntersect(pool, agencyShipmentTable, ["shipment_id"], [shipment_id]);

    if(!getShipmentInAgencyResult || getShipmentInAgencyResult.length <= 0) {
        return new Object({
            existed: false,
            message: `Lô hàng có mã ${shipment_id} không tồn tại trong bưu cục ${agency_id}!`
        });
    }

    return new Object({
        existed: true,
        message: `Lô hàng ${shipment_id} tồn tại trong bưu cục ${agency_id}!`
    })

}

const getDataForShipmentCode = async (staff_id, transport_partner_id = null) => {
    try {
        const staffTable = "staff";
        const transportPartnerTable = "transport_partner";
        const vehicleTable = "vehicle";

        if(transport_partner_id !== null) {
            const transportPartnerQuery = `SELECT transport_partner_name FROM ${transportPartnerTable} WHERE transport_partner_id = ? LIMIT 1`;
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
                partnerName: transportPartnerResult[0].transport_partner_name,
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

const createNewShipment = async (info, agency_id) => {
    const agencyTable = utils.getPostalCodeFromAgencyID(agency_id) + suffix;

    const fields = Object.keys(info);
    const values = Object.values(info);
    const defaultFields = ["mass", "order_ids", "parent", "status"];
    const defaultValues = [0, JSON.stringify([]), null, 0];

    const allFields = [...fields, ...defaultFields];
    const allValues = [...values, ...defaultValues];
    await dbUtils.insert(pool, agencyTable, allFields, allValues);
    const resultCheckingExistShipment = await checkExistShipment(info.shipment_id, agency_id);
    if(resultCheckingExistShipment.existed) {
        return new Object({
            success: true,
            message: `Tạo lô hàng ${info.shipment_id} trên bưu cục ${agency_id} thành công!`
        });
    }
    else {
        return new Object({
            success: false,
            message: "Tạo lô hàng thất bại!"
        });
    }
}


const addOrderToShipment = async (shipment_id, order_id, postal_code) => {
    const agencyShipmentsTable = postal_code + suffix;
    const agencyOrdersTable = postal_code + "_orders";

    const getOrderQuery = `SELECT parent, mass FROM ${agencyOrdersTable} WHERE order_id = ? LIMIT 1`;
    const [orderRow] = await pool.query(getOrderQuery, order_id);

    if (!orderRow || orderRow.length <= 0) {
        console.log("Order is not exist");
        return new Object({
            success: false,
            data: null,
            message: `Đơn hàng ${order_id} không tồn tại!`
        });
    }

    const { parent: orderParent, mass: orderMass } = orderRow[0];

    if (orderParent !== null && orderParent !== undefined) {
        console.log("Order already exist in shipment ", orderParent);
        return new Object({
            success: false,
            data: null,
            message: `Đơn hàng đã được quét lên lô hàng ${orderParent} từ trước!`
        });
    }

    const getBucketQuery = `SELECT order_ids FROM ${agencyShipmentsTable} WHERE shipment_id = ?`;
    const [bucket] = await pool.query(getBucketQuery, shipment_id);
    let prevOrderIds;
    if (bucket.length > 0) {
        prevOrderIds = JSON.parse(bucket[0].order_ids);
        if(prevOrderIds.includes(order_id)) {
            console.log("Order is contained in this shipment!");
            return new Object({
                success: false,
                data: null,
                message: `Đơn hàng ${order_id} tồn tại trong lô hàng ${shipment_id} này!`
            });
        }       
    } else {
        console.log("Shipment does not exist");
        return new Object({
            success: false,
            data: null,
            message: `Thông tin lô hàng ${shipment_id} không tồn tại!`
        });
    } 
    
    prevOrderIds.push(order_id);
    const jsonOrderIds = JSON.stringify(prevOrderIds);
    //append order_ids, cong mass
    //UPDATE `shipment` SET `order_ids` = JSON_ARRAY_APPEND(COALESCE(order_ids, '[]'), '$', "1");
    const updateShipmentQuery = `
        UPDATE ${agencyShipmentsTable}
        SET 
            order_ids = ?,
            mass = mass + ?
        WHERE shipment_id = ?
    `;
    const result = await pool.query(updateShipmentQuery,[jsonOrderIds, orderMass, shipment_id]);

    // return result[0];
    return new Object({
        success: true,
        data: {
            affectedRows: result ? result.affectedRows : 0,
            order_ids: jsonOrderIds,
            addingOrder: order_id
        },
        message: `Thêm đơn hàng ${order_id} vào lô hàng ${shipment_id} thành công!`
    });
    
}

const deleteOrderFromShipment = async (shipment_id, order_id, postal_code) => {
    const agencyShipmentsTable = postal_code + suffix;
    const agencyOrdersTable = postal_code + "_orders";
      
    const getOrderQuery = `SELECT mass FROM ${agencyOrdersTable} WHERE order_id = ?`;
    const [orderRow] = await pool.query(getOrderQuery, order_id);

    if (!orderRow || orderRow.length <= 0) {
        console.log("Order is not exist");
        return new Object({
            success: false,
            data: null,
            message: `Đơn hàng ${order_id} không tồn tại!`
        });
    }

    const { mass: orderMass } = orderRow[0];

    const getBucketQuery = `SELECT order_ids FROM ${agencyShipmentsTable} WHERE shipment_id = ?`;
    const [bucket] = await pool.query(getBucketQuery, shipment_id);
    let prevOrderIds;
    if (bucket.length > 0) {
        prevOrderIds = JSON.parse(bucket[0].order_ids);
        if(!prevOrderIds.includes(order_id)) {
            console.log("Order is not contained in shipment!");
            return new Object({
                success: false,
                data: null,
                message: `Đơn hàng ${order_id} không tồn tại trong lô hàng ${shipment_id} này!`
            });
        } else {
            const orderIndex = prevOrderIds.indexOf(order_id);
            prevOrderIds.splice(orderIndex, 1);
        }
        
    } else {
        console.log("Shipment does not exist");
        return new Object({
            success: false,
            data: null,
            message: `Thông tin lô hàng ${shipment_id} không tồn tại!`
        });
    } 
    
    // UPDATE `shipment`
    // SET order_ids = JSON_REMOVE(order_ids, JSON_UNQUOTE(JSON_SEARCH(order_ids, 'one', '2')))
    // WHERE shipment_id = 'TD20240423370236';
    const jsonOrderIds = JSON.stringify(prevOrderIds);

    const updateOrderQuery = `UPDATE ${agencyOrdersTable} SET parent = null WHERE order_id = ?`;
    await pool.query(updateOrderQuery, order_id);

    const updateShipmentQuery = `
            UPDATE ${agencyShipmentsTable}
            SET 
                order_ids = ?,
                mass = mass - ?
            WHERE shipment_id = ?;
    `;

    const result = await pool.query(updateShipmentQuery,[jsonOrderIds, orderMass, shipment_id]);
    
    return new Object({
        success: true,
        data: {
            affectedRows: result ? result.affectedRows : 0,
            order_ids: jsonOrderIds,
            deletingOrder: order_id
        },
        message: `Xóa đơn hàng ${order_id} khỏi lô hàng ${shipment_id} thành công!`
    });
}

//trường hợp thêm vào nếu thêm trên database tổng bị lỗi thì nhân viên bưu cục tự xóa trong db bưu cục
//nếu xóa ở createShipment thất bại
const deleteShipment = async (shipment_id, postal_code) => {
    const agencyTable = postal_code + suffix;
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

const updateShipment = async (fields, values, conditionFields, conditionValues, postal_code) => {
    try {
        const agencyTable = postal_code + suffix;
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

const getShipmentForAgency = async (fields, values, postal_code) => {
    try {
        //get all the order_id that have parent is shipment_id
        const ordersTable = postal_code + "_orders";
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

const getInfoShipment = async (shipment_id, postal_code) => {
    try {
        const agencyTable = postal_code + suffix;
        const query = `SELECT * FROM ${agencyTable} WHERE shipment_id = ?`;
        const [rows] = await pool.query(query, shipment_id);
        if (rows.length > 0) {
            const result = rows[0];
            if(result.hasOwnProperty("id")) {
                delete result.id;
            }
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
        
        const ordersTable = "orders";
        const query = `SELECT * FROM ${ordersTable} WHERE order_id = ?`;
        const [rows] = await pool.query(query, order_id);
        
        if (rows.length > 0) {
            const result = rows[0];
            if(result.hasOwnProperty("id")) {
                delete result.id;
            }
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

const updateParentForGlobalOrders = async (shipment_id, postal_code) => {
    const agencyShipmentsTable = postal_code + suffix;
    const agencyOrdersTable = postal_code + "_orders";
    const result = await dbUtils.findOneIntersect(pool, agencyShipmentsTable, ["shipment_id"], [shipment_id]);

    if (!result || result[0].length <= 0) {
        console.log("Shipment does not exist.");
        throw new Error("Lô hàng không tồn tại.");
    }

    const order_ids = JSON.parse(result[0].order_ids);

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

const compareOrdersInDatabase = async (shipment_id, ordersFromRequest, postal_code) => {
    const agencyShipmentsTable = postal_code + suffix;
    const agencyOrdersTable = postal_code + "_orders";
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
}

const recieveShipment = async (shipment_id, postal_code) => {

    const agencyOrdersTable = postal_code + "_orders";
    const getOrderIDsQuery = `SELECT order_ids FROM ${table} WHERE shipment_id = ?`;
    const [rows] = await pool.query(getOrderIDsQuery, shipment_id);

    if (rows.length > 0) {
        const order_ids = JSON.parse(rows[0].order_ids);
        console.log(order_ids);
        let result;
        for (const order_id of order_ids) {
            const orderData = await getInfoOrder(order_id);
            result = await dbUtils.insert(pool, agencyOrdersTable, orderData.fields, orderData.values);
        }
        //Xuất ra số lượng đơn hàng được thêm thành
        return result[0];
    } else {
        console.log("Shipment does not exist");
        throw new Error("Thông tin lô hàng không hợp lệ!");
    }

}

const decomposeShipment = async (shipment_id, order_ids , agency_id) => {
    const postal_code = utils.getPostalCodeFromAgencyID(agency_id);
    const agencyShipmentsTable = postal_code + suffix;
    const agencyOrdersTable = postal_code + "_orders";
    const compareOrders = await compareOrdersInDatabase(shipment_id, order_ids, postal_code);
    const { error, message } = compareOrders;    
    
    if (error) {
        console.log(message);
        throw new Error(message);
    }
    
    for (const order_id of order_ids) {
        const ordersQuery = `UPDATE ${agencyOrdersTable} SET parent = null WHERE order_id = ?`;
        await pool.query(ordersQuery, [order_id]);
        const orderInfo = new Object({
            order_id: order_id,
            shipment_id: shipment_id,
            managed_by: agency_id
        });
        await setStatusToOrder(orderInfo, servicesStatus.enter_agency, true);
    }

    const shipmentsQuery = `UPDATE ${agencyShipmentsTable} SET status = 1 WHERE shipment_id = ? `;
    return await pool.query(shipmentsQuery, [shipment_id]);
}

// status_code cho orders, shipper cho orders, shipment_ids cho vehicle

const undertakeShipment = async (shipment_id, staff_id, agency_id, status_code) => {
    const postal_code = utils.getPostalCodeFromAgencyID(agency_id);
    const agencyShipmentsTable = postal_code + "_shipment";
    const agencyOrdersTable = postal_code + "_orders";
    const getOrderIDsQuery = `SELECT order_ids FROM ${agencyShipmentsTable} WHERE shipment_id = ?`;
    const [getOrderIDsResult] = await pool.query(getOrderIDsQuery, shipment_id);

    const assignShipmentQuery = `UPDATE vehicle SET shipment_ids = ? WHERE staff_id = ?`;
    const assignShipmentResult = await pool.query(assignShipmentQuery, [JSON.stringify(shipment_id), staff_id]);
    if(assignShipmentResult.affectedRows <= 0) {
        return new Object({
            success: false,
            data: null,
            message: "Thông tin nhân viên giao hàng không tồn tại!"
        });
    }

    const order_ids = JSON.parse(getOrderIDsResult[0].order_ids);
    let acceptedArray = new Array();
    let unacceptedArray = new Array();
    for(let i = 0; i < order_ids.length; i++) {
        const assignShipperQuery = `UPDATE ${agencyOrdersTable} SET shipper = ?, status_code = ? WHERE order_id = ?`;
        const assignShipperResult = await pool.query(assignShipperQuery, [staff_id, status_code, order_ids[i]]);
        
        if(assignShipperResult[0].affectedRows > 0) {
            const assignShipperToDatabaseQuery = `UPDATE orders SET shipper = ? WHERE order_id = ?`;
            const assignShipperToDatabaseResult = await pool.query(assignShipperToDatabaseQuery, [staff_id, order_ids[i]]);
            const orderInfo = new Object({
                order_id: order_ids[i],
                // shipment_id: shipment_id,
                // managed_by: staff_id,
            });
            await setStatusToOrder(orderInfo, {code: status_code, message: servicesStatus.getStatusMessage(status_code)}, false);
            acceptedArray.push(order_ids[i]);
        } else {
            unacceptedArray.push(order_ids[i]);
        }
    }

    return new Object({
        success: true,
        data: {
            numberAccepted: acceptedArray.length,
            acceptedArray: acceptedArray,
            numberunaccepted: unacceptedArray.length,
            unacceptedArray: unacceptedArray,
            shipperUndertake: staff_id
        },
        message: `Lô hàng có mã ${shipment_id} đã được đảm nhận bởi nhân viên có mã ${staff_id}`
    })

}


module.exports = {
    checkExistShipment,
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
    getShipmentForAdmin,
    getShipmentForAgency,
    decomposeShipment,
    updateShipmentToDatabase,
    deleteShipment,
    deleteGlobalShipment,
    undertakeShipment,
};