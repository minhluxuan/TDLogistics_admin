const mysql = require("mysql2");
const utils = require("./utils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "staff";

const pool = mysql.createPool(dbOptions).promise();

const checkExistStaff = async (fields, values) => {
  	return await utils.findOne(pool, table, fields , values);
};

const createNewStaff = async (fields , values) => {
	const lastUser = await utils.getLastRow(pool, table);

	let staffId = "000000";

	if (lastUser) 
	{
		staffId = (parseInt(lastUser["staff_id"]) + 1).toString().padStart(6, "0");
	}

	fields.push("staff_id");
	values.push(staffId);

	await utils.insert(pool, table, fields, values);
};

const getManyStaffs = async (fields, values) => {
  	return await utils.find(pool, table, fields, values);
};

const getOneStaff = async (fields, values) => {
  	return await utils.findOne(pool, table, fields, values);
};

const updateStaff = async (fields, values, conditionFields, conditionValues) => {
  	return await utils.update(pool, table, fields, values,conditionFields,conditionValues);
};

const deleteStaff= async(fields, values) => {
  	return await utils.deleteOne(pool, table, fields, values);
};

module.exports = {
    checkExistStaff,
    createNewStaff,
    getOneStaff,
    getManyStaffs,
    updateStaff,
    deleteStaff
};
