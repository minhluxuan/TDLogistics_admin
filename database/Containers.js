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

const pool = mysql.createPool(dbOptions).promise();

const table = "shipment";
const vehicleTable = "vehicle";
const shipmentTable = "shipment";

const createContainer = async (shipment_id, container_id) => {
    //chỉ dành cho trường hợp máy bay và tàu hỏa 
    const query = `UPDATE ${table} SET parent = ? WHERE shipment_id = ?`;
    try {
        const result = await pool.query(query, [container_id, shipment_id]);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
};

const updateInContainer = async (shipment_id, container_id) => {
    try {
        const getShipmentQuery = `SELECT mass, parent FROM ${table} WHERE shipment_id = ?`;
        const [shipmentRows] = await pool.query(getShipmentQuery, [shipment_id]);

        if (shipmentRows.length <= 0) {
            throw new Error("Lô hàng không tồn tại.");
        }

        const { mass: shipmentMass, parent: shipmentParent } = shipmentRows[0];
        
        if (shipmentParent === container_id) {
            throw new Error("Lô hàng đã được quét lên từ trước!");
        }

        const vehicleQuery = `SELECT mass, max_load FROM ${vehicleTable} WHERE vehicle_id = ?`;
        const [vehicleRows] = await pool.query(vehicleQuery, [container_id]);

        if(vehicleRows.length <= 0) {
            throw new Error("Phương tiện không tồn tại.");
        }

        const { mass: currentMass, max_load: maxLoad } = vehicleRows[0];

        if (currentMass + shipmentMass > maxLoad) {
            throw new Error("Thêm lô hàng vào phương tiện thất bại. Lô hàng vượt quá tải trọng cho phép.");
        }

        const shipmentQuery = `UPDATE ${table} SET parent = ? WHERE shipment_id = ?`;
        const resultUpdatingShipment = await pool.query(shipmentQuery, [container_id, shipment_id]);

        if (resultUpdatingShipment[0].affectedRows <= 0) {
            throw new Error("Thêm lô hàng vào phương tiện thất bại.");
        }

        const query = `UPDATE ${vehicleTable} SET mass = mass + ? WHERE vehicle_id = ?`;
        const result =  await pool.query(query, [shipmentMass, container_id]);
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error(error);
    }
};

const updateOutContainer = async (shipment_id, container_id) => {
    try {
        const getShipmentQuery = `SELECT parent, mass FROM ${table} WHERE shipment_id = ?`;
        const [shipmentRows] = await pool.query(getShipmentQuery, [shipment_id]);

        if (shipmentRows.length <= 0) {
            throw new Error("Lô hàng không tồn tại.");
        }

        const { parent: shipmentParent, mass: shipmentMass } = shipmentRows[0];
        
        if (shipmentParent !== container_id) {
            throw new Error("Lô hàng không hợp lệ!");
        }  
    
        const vehicleQuery = `SELECT mass FROM ${vehicleTable} WHERE vehicle_id = ?`;
        const [vehicleRows] = await pool.query(vehicleQuery, [container_id]);

        if (vehicleRows[0].length <= 0) {
            throw new Error("Phương tiện không tồn tại.");
        }

        const { mass: currentMass } = vehicleRows[0];

        if(currentMass - shipmentMass < 0) {
            throw new Error("Lô hàng không hợp lệ.");
        }
        
        const updateShipmentQuery = `UPDATE ${table} SET parent = NULL WHERE shipment_id = ?`;
        const resultUpdatingShipment = await pool.query(updateShipmentQuery, [shipment_id]);

        if (resultUpdatingShipment[0].affectedRows <= 0) {
            throw new Error("Xóa lô hàng khỏi phương tiện thất bại.");
        }

        const query = `UPDATE ${vehicleTable} SET mass = mass - ? WHERE vehicle_id = ?`;
        const result = await pool.query(query, [shipmentMass, container_id]);
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error(error.message);
    }
};


const getContainer = async (container_id) => {
    try {
        //get all the shipment_id that have parent is container_id
        const getShipmentQuery = `SELECT shipment_id FROM ${shipmentTable} WHERE parent = ?`;
        const [rows] = await pool.query(getShipmentQuery, [container_id]);
        const result = rows.map(row => row.shipment_id);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút.");
    }
}

module.exports = {
    createContainer,
    updateInContainer,
    updateOutContainer,
    getContainer,
};