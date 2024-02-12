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

const checkExistPartnerStaff = async (conditions) => {
	const fields = Object.keys(conditions);
	const values = Object.values(conditions);console.log(fields, values);

	const result = await dbUtils.findOneUnion(pool, table, fields, values);

	return result.length > 0;
};

const createNewPartnerStaff = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.insert(pool, table, fields, values);
};

const getManyPartnerStaffs = async (fields, values) => {
  	return await dbUtils.find(pool, table, fields, values);
};

const getOnePartnerStaff = async (fields, values) => {
  	return await dbUtils.findOne(pool, table, fields, values);
};

const updatePartnerStaff = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	
	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);

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
