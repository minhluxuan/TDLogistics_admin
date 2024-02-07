const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "business_user";

const pool = mysql.createPool(dbOptions).promise();

const checkExistBusiness = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  	const result = await dbUtils.findOneUnion(pool, table, fields , values);
	return result.length > 0;
};

const createNewBusinessUser = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.insert(pool, table, fields, values);
};

const createNewRepresentor = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.insert(pool, "business_representor", fields, values);
};

const getManyBussinessUsers = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  	return await dbUtils.find(pool, table, fields, values);
};

const getOneBusinessUser = async (fields, values) => {
  	return await dbUtils.findOne(pool, table, fields, values);
};

const updateBusinessUser= async (fields, values, conditionFields, conditionValues) => {
	return await dbUtils.update(pool, table, fields, values,conditionFields,conditionValues);
};

const deleteBusinessUSer= async(fields, values) => {
	return await dbUtils.deleteOne(pool, table, fields, values);
};

module.exports = {
	checkExistBusiness,
	createNewBusinessUser,
	createNewRepresentor,
	getManyBussinessUsers,
	getOneBusinessUser,
	updateBusinessUser,
	deleteBusinessUSer
}