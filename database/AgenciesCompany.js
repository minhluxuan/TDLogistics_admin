const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");
const logger = require("../lib/logger");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const agencyCompayTable = "agency_company";

const pool = mysql.createPool(dbOptions).promise();

const createNewAgencyCompany = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	return await dbUtils.insert(pool, agencyCompayTable, fields, values);
}

const updateAgencyCompany = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);

	return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

const getOneAgencyCompany = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  return await dbUtils.findOneIntersect(pool, table, fields, values);
};

module.exports = {
  createNewAgencyCompany,
  updateAgencyCompany,
  getOneAgencyCompany,
}