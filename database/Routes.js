const { Cipher } = require("crypto");
const dbUtils = require("../lib/dbUtils");
const mysql = require("mysql2");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};


const pool = mysql.createPool(dbOptions).promise();
const table = "route";

const checkExistRoute = async (condition) => {
    const fields = Object.keys(condition);
    const values = Object.values(condition);

    return (await dbUtils.findOneIntersect(pool, table, fields, values)).length > 0;
}

const createNewRoute = async (info) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    return await dbUtils.insert(pool, table, fields, values);
}

const getOneRoute = async (conditions) => {
    if (!conditions.from_departure_time && conditions.to_departure_time || conditions.from_departure_time && !conditions.to_departure_time) {
        return new Array();
    }

    if (conditions.from_departure_time && conditions.to_departure_time) {
        const from_departure_time = conditions.from_departure_time;
        const to_departure_time = conditions.to_departure_time;

        delete conditions.from_departure_time;
        delete conditions.to_departure_time;

        const fields = Object.keys(conditions);
        const values = Object.values(conditions);

        let query = `SELECT r.*, v.transport_partner_id, v.agency_id, v.staff_id, v.type, v.license_plate, v.mass, v.max_load, v.busy, v.created_at, v.last_update FROM ${table} AS r INNER JOIN vehicle AS v ON r.vehicle_id = v.vehicle_id WHERE r.departure_time >= ? AND r.departure_time <= ?`;

        if (fields && values && fields.length > 0 && values.length > 0) {
            query += ` AND ${fields.map(field => `r.${field} = ?`).join(" AND ")}`;
        }

        query += " LIMIT 1";

        return (await pool.query(query, [from_departure_time, to_departure_time, ...values]))[0];
    }

    const fields = Object.keys(conditions);
    const values = Object.values(conditions);
    if (fields && values && fields.length > 0 && values.length > 0) {
        const query = `SELECT r.*, v.transport_partner_id, v.agency_id, v.staff_id, v.type, v.license_plate, v.mass, v.max_load, v.busy, v.created_at, v.last_update FROM ${table} AS r INNER JOIN vehicle AS v ON r.vehicle_id = v.vehicle_id WHERE ${fields.map(field => `r.${field} = ?`).join(" AND ")} LIMIT 1`;
        return (await pool.query(query, values))[0];
    }

    const query = `SELECT r.*, v.transport_partner_id, v.agency_id, v.staff_id, v.type, v.license_plate, v.mass, v.max_load, v.busy, v.created_at, v.last_update FROM ${table} AS r INNER JOIN vehicle AS v ON r.vehicle_id = v.vehicle_id LIMIT 1`;
    return (await pool.query(query, values))[0];
}

const getRoutes = async (conditions) => {
    if (!conditions.from_departure_time && conditions.to_departure_time || conditions.from_departure_time && !conditions.to_departure_time) {
        return new Array();
    }

    if (conditions.from_departure_time && conditions.to_departure_time) {
        const from_departure_time = conditions.from_departure_time;
        const to_departure_time = conditions.to_departure_time;

        delete conditions.from_departure_time;
        delete conditions.to_departure_time;

        const fields = Object.keys(conditions);
        const values = Object.values(conditions);

        let query = `SELECT r.*, v.transport_partner_id, v.agency_id, v.staff_id, v.type, v.license_plate, v.mass, v.max_load, v.busy, v.created_at, v.last_update FROM ${table} AS r INNER JOIN vehicle AS v ON r.vehicle_id = v.vehicle_id WHERE r.departure_time >= ? AND r.departure_time <= ?`;

        if (fields && values && fields.length > 0 && values.length > 0) {
            query += ` AND ${fields.map(field => `r.${field} = ?`).join(" AND ")}`;
        }

        return (await pool.query(query, [from_departure_time, to_departure_time, ...values]))[0];
    }

    const fields = Object.keys(conditions);
    const values = Object.values(conditions);
    if (fields && values && fields.length > 0 && values.length > 0) {
        const query = `SELECT r.*, v.transport_partner_id, v.agency_id, v.staff_id, v.type, v.license_plate, v.mass, v.max_load, v.busy, v.created_at, v.last_update FROM ${table} AS r INNER JOIN vehicle AS v ON r.vehicle_id = v.vehicle_id WHERE ${fields.map(field => `r.${field} = ?`).join(" AND ")}`;
        return (await pool.query(query, values))[0];
    }

    const query = `SELECT r.*, v.transport_partner_id, v.agency_id, v.staff_id, v.type, v.license_plate, v.mass, v.max_load, v.busy, v.created_at, v.last_update FROM ${table} AS r INNER JOIN vehicle AS v ON r.vehicle_id = v.vehicle_id`;
    return (await pool.query(query, values))[0];
}

const updateRoute = async (info, condition) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const conditionFields = Object.keys(condition);
    const conditionValues = Object.values(condition);

    return await dbUtils.updateOne(pool, table, fields, values, conditionFields, conditionValues);
}

const deleteRoute = async (condition) => {
    const fields = Object.keys(condition);
    const values = Object.values(condition);

    return await dbUtils.deleteOne(pool, table, fields, values);
}

module.exports = {
    checkExistRoute,
    createNewRoute,
    getOneRoute,
    getRoutes,
    updateRoute,
    deleteRoute,
}