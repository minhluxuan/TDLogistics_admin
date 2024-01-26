const mysql = require("mysql2");
const utils = require("./utils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "agency";

const pool = mysql.createPool(dbOptions).promise();

const checkExistAgency = async (fields, values) => {
	const result = await utils.findOne(pool, table, fields , values);
	return result.length > 0;
}

const getOneAgency = async (fields, values) => {
    return await utils.findOne(pool, table, fields, values);
};

const getManyAgencies = async (fields, values) => {
	return await utils.find(pool, table, fields, values);
};

const createNewAgency = async (fields, values) => {
	return await utils.insert(pool, table, fields, values);
}

const updateAgency = async (fields, values, conditionFields, conditionValues) => {
	return await utils.update(pool, table, fields, values, conditionFields, conditionValues);
};

const deleteAgency= async(fields, values) => {
	return await utils.deleteOne(pool, table, fields, values);
};

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
  await utils.update(pool, table, fields, values, conditionFields, conditionValues);
};


module.exports = { 
	checkExistAgency,
    getOneAgency,
	getManyAgencies,
	createNewAgency,
	deleteAgency,
	updatePassword,
	updateAgency,
};