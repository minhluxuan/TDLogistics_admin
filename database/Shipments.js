const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");
const Orders = require("./Orders");
const utils = require("../lib/utils");
const { setStatusToOrder } = require("./Orders");
const servicesStatus = require("../lib/servicesStatus");
const Vehicles = require("./Vehicles");
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

const checkExistShipment = async (conditions, postal_code = null) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);
    
    const shipmentTable = postal_code ? postal_code + '_' + table : table;
    const resultGettingOneShipment = await dbUtils.findOneIntersect(pool, shipmentTable, fields, values);
    
    return resultGettingOneShipment.length > 0;
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

const createNewShipment = async (info, postalCode = null) => {
    const shipmentTable = postalCode ? postalCode + '_' + table : table;
    const fields = Object.keys(info);
    const values = Object.values(info);
    const defaultFields = ["mass", "order_ids", "parent", "status"];
    const defaultValues = [0, JSON.stringify([]), null, 0];

    const allFields = [...fields, ...defaultFields];
    const allValues = [...values, ...defaultValues];
    return await dbUtils.insert(pool, shipmentTable, allFields, allValues);
}

const updateParentAndIncreaseMass = async (shipment_id, order_id, postal_code = null) => {
    const ordersTable = postal_code ? postal_code + '_' + "orders" : "orders";
    const resultGettingOneOrder = await dbUtils.findOneIntersect(pool, ordersTable, ["order_id"], [order_id]);

    if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
        console.log("Order does not exist.");
        return false;
    }

    const order = resultGettingOneOrder[0];
    const orderMass = order.mass ? order.mass : 0;

    if (order.parent === shipment_id) {
        console.log("Order was added to shipment before.");
        return false;
    }

    const shipmentQuery = 'UPDATE ?? SET ?? = ?? + ? WHERE ?? = ?';
    const shipmentTable = postal_code ? postal_code + '_' + table : table; 
    const result = await pool.query(shipmentQuery, [shipmentTable, "mass", "mass", orderMass, "shipment_id", shipment_id]);

    if (!result || result.length === 0) {
        console.log("Shipment does not exist.");
        throw new Error(`Lô hàng có mã ${shipment_id} không tồn tại.`);
    }

    const orderQuery = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
    await pool.query(orderQuery, [ordersTable, "parent", shipment_id, "order_id", order_id]);

    return true;
}


const updateParentAndDecreaseMass = async (shipment_id, order_id, postal_code = null) => {
    const ordersTable = postal_code ? postal_code + '_' + "orders" : "orders";
    const resultGettingOneOrder = await dbUtils.findOneIntersect(pool, ordersTable, ["order_id"], [order_id]);

    if (!resultGettingOneOrder || resultGettingOneOrder.length === 0) {
        console.log("Order does not exist.");
        return false;
    }

    const order = resultGettingOneOrder[0];
    const orderMass = order.mass ? order.mass : 0;

    const shipmentQuery = 'UPDATE ?? SET ?? = ?? - ? WHERE ?? = ?';
    const shipmentTable = postal_code ? postal_code + '_' + table : table; 
    const result = await pool.query(shipmentQuery, [shipmentTable, "mass", "mass", orderMass, "shipment_id", shipment_id]);

    if (!result || result.length <= 0) {
        console.log("Shipment does not exist.");
        throw new Error(`Lô hàng có mã ${shipment_id} không tồn tại.`);
    }

    const orderQuery = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
    await pool.query(orderQuery, [ordersTable, "parent", null, "order_id", order_id]);

    return true;
}

const getOrdersFromShipment = async (order_ids) => {
    const orders = new Array();

    for (const order_id of order_ids) {
        const resultGettingOneOrder = await Orders.getOneOrder({ order_id });
        if (resultGettingOneOrder && resultGettingOneOrder.length > 0) {
            try {
                resultGettingOneOrder[0].journey = JSON.parse(resultGettingOneOrder[0].journey);
                orders.push(resultGettingOneOrder[0]);
            } catch (error) {
                orders.push(resultGettingOneOrder[0]);
            }
        }
    }

    return orders;
}

const addOrdersToShipment = async (shipment, order_ids, postal_code = null) => {
    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();
    let jsonOrderIds;

    const shipmentTable = postal_code ? postal_code + '_' + table : table;
    if (shipment.order_ids) {
        const prevOrderIds = JSON.parse(shipment.order_ids);
        for (let i = 0; i < order_ids.length; i++) {
            if (!prevOrderIds.includes(order_ids[i]) && await updateParentAndIncreaseMass(shipment.shipment_id, order_ids[i], postal_code)) {
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

    const result = await dbUtils.updateOne(pool, shipmentTable, ["order_ids"], [jsonOrderIds], ["shipment_id"], [shipment.shipment_id]);

    return new Object({
        affectedRows: result ? result.affectedRows : 0,
        acceptedNumber: acceptedNumber,
        acceptedArray: acceptedArray,
        notAcceptedNumber: notAcceptedNumber,
        notAcceptedArray: notAcceptedArray,
    });
}

const deleteOrdersFromShipment = async (shipment, order_ids, postal_code = null) => {
    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();
    let jsonOrderIds;

    const shipmentTable = postal_code ? postal_code + '_' + table : table;
    if (shipment.order_ids) {
        const prevOrderIds = JSON.parse(shipment.order_ids);
        for (let i = 0; i < order_ids.length; i++) {
            const orderIndex = prevOrderIds.indexOf(order_ids[i]);
            if (orderIndex >= 0 && await updateParentAndDecreaseMass(shipment.shipment_id, order_ids[i], postal_code)) {
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

    const result = await dbUtils.updateOne(pool, shipmentTable, ["order_ids"], [jsonOrderIds], ["shipment_id"], [shipment.shipment_id]);

    return new Object({
        affectedRows: result ? result.affectedRows : 0,
        acceptedNumber: acceptedNumber,
        acceptedArray: acceptedArray,
        notAcceptedNumber: notAcceptedNumber,
        notAcceptedArray: notAcceptedArray,
    });
}

//trường hợp thêm vào nếu thêm trên database tổng bị lỗi thì nhân viên bưu cục tự xóa trong db bưu cục
//nếu xóa ở createShipment thất bại
const deleteShipment = async (shipment_id, postal_code = null) => {
    const shipmentTable = postal_code ? postal_code + '_' + table : table;
    return await dbUtils.deleteOne(pool, shipmentTable, ["shipment_id"], [shipment_id]);
}

const deleteGlobalShipment = async (shipment_id) => {
    return await dbUtils.deleteOne(pool, table, ["shipment_id"], [shipment_id]);
}

const updateShipmentForAgency = async (info, conditions, postal_code) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    return dbUtils.updateOne(pool, postal_code + '_' + table, fields, values, conditionFields, conditionValues);
};

const updateShipment = async (info, conditions, postalCode) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    const shipmentTable = postalCode ? postalCode + '_' + table : table;

    return dbUtils.updateOne(pool, shipmentTable, fields, values, conditionFields, conditionValues);
};

const getShipments = async (conditions, paginationConditions, postal_code) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const limit = paginationConditions.rows || 0;
    const offset = paginationConditions.page ? paginationConditions.page * limit : 0;

    const shipmentTable = postal_code ? postal_code + '_' + table : table;
    const shipments = await dbUtils.find(pool, shipmentTable, fields, values, limit, offset);
    for (const shipment of shipments) {
        try {
            if (shipment.order_ids) {
                shipment.order_ids = JSON.parse(shipment.order_ids);
            }
        } catch(error) {
            // Nothing to do
        }
    }

    return shipments;
}

const getOneShipment = async (conditions, postal_code) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const shipmentTable = postal_code ? postal_code + '_' + table : table;
    return await dbUtils.findOneIntersect(pool, shipmentTable, fields, values);
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

const updateParentForGlobalOrders = async (order_ids, shipment_id) => {
    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();

    for (const order_id of order_ids) {
        const resultUpdatingOrder = await dbUtils.updateOne(pool, "orders", ["parent"], [shipment_id], ["order_id"], [order_id]);

        if (!resultUpdatingOrder || resultUpdatingOrder.length === 0) {
            notAcceptedNumber++;
            notAcceptedArray.push(order_id);
        }
        else {
            acceptedNumber++;
            acceptedArray.push(order_id);
        }
    }

    return new Object({
        acceptedNumber,
        acceptedArray,
        notAcceptedNumber,
        notAcceptedArray,
    });
}

const confirmCreateShipment = async (info) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

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

const receiveShipment = async (shipment_id, postal_code) => {
    const agencyOrdersTable = postal_code + "_orders";
    const agencyShipmentTable = postal_code + suffix;
    const getShipmentResult = await getInfoShipment(shipment_id);
    const cloneShipmentFromGlobal = await dbUtils.insert(pool, agencyShipmentTable, getShipmentResult.fields, getShipmentResult.values);


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

const decomposeShipment = async (order_ids, shipment_id, agency_id) => {
    let updatedNumber = 0;
    const agencyShipmentTable = utils.getPostalCodeFromAgencyID(agency_id) + suffix;
    const updatedArray = new Array();
    const orderIdsSet = new Set(order_ids);

    for (const order_id of orderIdsSet) {
        const resultUpdatingOneOrder = await dbUtils.updateOne(pool, "orders", ["parent"], [null], ["order_id"], [order_id]);
        const orderInfo = new Object({
            order_id: order_id,
            shipment_id: shipment_id,
            managed_by: agency_id
        });

        const resultUpdatingOneOrderStatus = await setStatusToOrder(orderInfo, servicesStatus.enter_agency, true);

        if (resultUpdatingOneOrder && resultUpdatingOneOrder.affectedRows > 0 && resultUpdatingOneOrderStatus.success) {
            updatedNumber++;
            updatedArray.push(order_id);
        }
    }

    const shipmentsQuery = `UPDATE ${agencyShipmentTable} AS q1 JOIN ${table} AS q2
                            ON q1.shipment_id = q2.shipment_id
                            SET q1.status = ?, q2.status = ?, agency_id_dest = ? WHERE q1.shipment_id = ? `;
    await pool.query(shipmentsQuery, [true, true, agency_id, shipment_id]);

    return new Object({
        updatedNumber,
        updatedArray,
    });
}

const pasteShipmentToAgency = async (shipment, postalCode) => {
    const fields = Object.keys(shipment);
    const values = Object.values(shipment);

    const shipmentTable = postalCode + '_' + table;
    return await dbUtils.insert(pool, shipmentTable, fields, values);
}

const cloneOrdersFromGlobalToAgency = async (order_ids, postalCode) => {
    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();

    for (const order_id of order_ids) {
        try {
            const resultGettingOneOrder = await Orders.getOneOrder({ order_id });
            if (resultGettingOneOrder && resultGettingOneOrder.length > 0) {
                const resultCreatingNewOrder = await Orders.createNewOrder(resultGettingOneOrder[0], postalCode);
                if (resultCreatingNewOrder && resultCreatingNewOrder.affectedRows > 0) {
                    acceptedNumber++;
                    acceptedArray.push(order_id);
                }
                else {
                    notAcceptedNumber++;
                    notAcceptedArray.push(order_id);
                }
            }
            else {
                notAcceptedNumber++;
                notAcceptedArray.push(order_id);
            }
        } catch (error) {
            notAcceptedNumber++;
            notAcceptedArray.push(order_id);
        }
    }
    
    return new Object({
        acceptedNumber,
        acceptedArray,
        notAcceptedNumber,
        notAcceptedArray,
    });
}

// status_code cho orders, shipper cho orders, shipment_ids cho vehicle

const addOneShipmentToVehicle = async (shipment_id, staff_id) => {
    return await Vehicles.updateVehicle({ shipment_ids: JSON.stringify([shipment_id]) }, { staff_id });
}

const updateOrders = async (order_ids, staff_id, postal_code) => {
    let acceptedNumber = 0;
    const acceptedArray = new Array();
    let notAcceptedNumber = 0;
    const notAcceptedArray = new Array();
    for(let i = 0; i < order_ids.length; i++) {
        const resultAssigningShipperToOrderInAgency = await dbUtils.updateOne(pool, postal_code + '_' + "orders", ["shipper"], [staff_id], ["order_id"], [order_ids[i]])

        if(resultAssigningShipperToOrderInAgency && resultAssigningShipperToOrderInAgency.affectedRows > 0) {
            const resultAssignShipperToDatabase = await dbUtils.updateOne(pool, "orders", ["shipper"], [staff_id], ["order_id"], [order_ids[i]]);
            if (resultAssignShipperToDatabase && resultAssignShipperToDatabase.affectedRows > 0) {
                acceptedNumber++;
                acceptedArray.push(order_ids[i]);
            }
            else {
                notAcceptedNumber++;
                notAcceptedArray.push(order_ids[i]);
            }
        } else {
            notAcceptedNumber++;
            notAcceptedArray.push(order_ids[i]);
        }
    }

    return new Object({
        numberAccepted: acceptedNumber,
        acceptedArray: acceptedArray,
        notAcceptedNumber: notAcceptedNumber,
        notAcceptedArray: notAcceptedArray,
    });
}

module.exports = {
    checkExistShipment,
    createNewShipment,
    updateParentForGlobalOrders,
    confirmCreateShipment,
    getDataForShipmentCode,
    updateShipment,
    receiveShipment,
    getOrdersFromShipment,
    addOrdersToShipment,
    deleteOrdersFromShipment,
    updateOrderToDatabase,
    getShipments,
    getOneShipment,
    decomposeShipment,
    pasteShipmentToAgency,
    cloneOrdersFromGlobalToAgency,
    updateShipmentToDatabase,
    deleteShipment,
    deleteGlobalShipment,
    addOneShipmentToVehicle,
    updateOrders,
};