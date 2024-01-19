const mysql = require("mysql2");
const utils = require("./utils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "business_user";

const pool = mysql.createPool(dbOptions).promise();

const checkExistBusiness = async (fields, values) => {
  	const result = await utils.findOne(pool, table, fields , values);
	return result.length > 0;
};

const createNewBusinessUser = async (fields, values) => {
	const lastUser = await utils.getLastRow(pool, table);

	let businessID = "0000000";

	if (lastUser) {
		businessID = (parseInt(lastUser["business_id"]) + 1).toString().padStart(7, "0");
	}

	fields.push("business_id");
	values.push(businessID);

	await utils.insert(pool, table, fields, values);
};

const getManyBussinessUsers = async (fields, values) => {
  	return await utils.find(pool, table, fields, values);
};

const getOneBusinessUser = async (fields, values) => {
  	return await utils.findOne(pool, table, fields, values);
};

module.exports={
	checkExistBusiness,
	createNewBusinessUser,
	getManyBussinessUsers,
	getOneBusinessUser,
}