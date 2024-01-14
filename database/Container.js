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
        const vehicleTable = "vehicle";

        const getMassQuery = `SELECT mass FROM ${table} WHERE shipment_id = ?`;
        const [shipmentRows] = await pool.query(getMassQuery, [shipment_id]);
        const { mass: shipmentMass } = shipmentRows[0];

        const vehicleQuery = `SELECT mass, max_load FROM ${vehicleTable} WHERE vehicle_id = ?`;
        const [vehicleRows] = await pool.query(vehicleQuery, [container_id]);
        if(vehicleRows.length === 0) {
            throw new Error("Không tìm thấy thông tin xe!");
        }
        const { mass: currentMass, max_load: maxLoad } = vehicleRows[0];
        if(currentMass + shipmentMass > maxLoad) {
            throw new Error("Lỗi quá tải trọng cho phép!");
        }
        console.log(currentMass, maxLoad, shipmentMass);
        const shipmentQuery = `UPDATE ${table} SET parent = ? WHERE shipment_id = ?`;
        await pool.query(shipmentQuery, [container_id, shipment_id]);


        const query = `UPDATE ${vehicleTable} SET mass = mass + ? WHERE vehicle_id = ?`;
        const result =  await pool.query(query, [shipmentMass, container_id]);
        return result[0];

    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
};

const updateOutContainer = async (shipment_id, container_id) => {
    try {
        const vehicleTable = "vehicle";

        const getShipmentQuery = `SELECT parent, mass FROM ${table} WHERE shipment_id = ?`;
        const [shipmentRows] = await pool.query(getShipmentQuery, [shipment_id]);
        const { parent: shipmentParent, mass: shipmentMass } = shipmentRows[0];
        if(shipmentParent !== container_id) {
            throw new Error("Lô hàng không hợp lệ!");
        }
        
    
        const vehicleQuery = `SELECT mass FROM ${vehicleTable} WHERE vehicle_id = ?`;
        const [vehicleRows] = await pool.query(vehicleQuery, [container_id]);
        const { mass: currentMass } = vehicleRows[0];
        if(currentMass - shipmentMass < 0) {
            throw new Error("Lô hàng không hợp lệ!");
        }
        
        const updateShipmentQuery = `UPDATE ${table} SET parent = NULL WHERE shipment_id = ?`;
        await pool.query(updateShipmentQuery, [shipment_id]);

        const query = `UPDATE ${vehicleTable} SET mass = mass - ? WHERE vehicle_id = ?`;
        const result = await pool.query(query, [shipmentMass, container_id]);
        return result[0];

    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
};


const getContainer = async (container_id) => {
    try {
        //get all the shipment_id that have parent is container_id
        const shipmentTable = "shipment";
        const getShipmentQuery = `SELECT shipment_id FROM ${shipmentTable} WHERE parent = ?`;
        const [rows] = await pool.query(getShipmentQuery, [container_id]);
        const result = rows.map(row => row.shipment_id);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw error;
    }
}

module.exports = {
    createContainer,
    updateInContainer,
    updateOutContainer,
    getContainer,
};