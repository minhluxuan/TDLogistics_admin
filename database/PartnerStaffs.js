const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "partner_staff";

const pool = mysql.createPool(dbOptions).promise();

const checkExistPartnerStaff = async (fields, values) => {
	const query = `SELECT * FROM ${table} WHERE ${fields.map(field => `${field} = ?`).join(' OR ')}`;
	const result = await pool.query(query, values);
	return result[0].length > 0;
};

const createNewPartnerStaff = async (fields, values) => {
	const lastUser = await dbUtils.getLastRow(pool, table);

	let partnerStaffId = "0000000";

	if (lastUser) {
		partnerStaffId = (parseInt(lastUser["staff_id"]) + 1).toString().padStart(7, "0");
	}

	fields.push("staff_id");
	values.push(partnerStaffId);

	await dbUtils.insert(pool, table, fields, values);
};

const getManyPartnerStaffs = async (fields, values) => {
  	return await dbUtils.find(pool, table, fields, values);
};

const getOnePartnerStaff = async (fields, values) => {
  	return await dbUtils.findOne(pool, table, fields, values);
};

const updatePartnerStaff = async (fields, values, conditionFields, conditionValues) => {
  	return await dbUtils.update(pool, table, fields, values, conditionFields,conditionValues);
};

const deletePartnerStaff= async(fields, values) => {
  	return await dbUtils.deleteOne(pool, table, fields, values);
};

const updatePartnerPassword = async (fields, values, conditionFields, conditionValues) => {
	await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

module.exports = {
	checkExistPartnerStaff,
	createNewPartnerStaff,
	getManyPartnerStaffs,
	getOnePartnerStaff,
	updatePartnerStaff,
	deletePartnerStaff,
	updatePartnerPassword,
};
