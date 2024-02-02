const mysql = require("mysql2");
const utils = require("./utils");
const dbUtils = require("../lib/dbUtils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "staff";

const pool = mysql.createPool(dbOptions).promise();

const checkExistStaff = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	const result = await dbUtils.findOne(pool, table, fields, values);

	if (!result) {
		throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút.");
	}

	if (result.length <= 0) {
		return new Object({
			existed: false,
			message: "Người dùng chưa tồn tại.",
		});
	}

	for (let i = 0; i < fields.length; i++) {
		if (result[0][fields[i]] === values[i]) {
			return new Object({
				existed: true,
				message: `Người dùng có ${fields[i]}: ${values[i]} đã tồn tại.`,
			});
		}
	}
};

const createNewStaff = async (info, postal_code = null) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	if (!info.hasOwnProperty("staff_id")) {
		const lastUser = await utils.getLastRow(pool, table);

		let staffId = "0000000";

		if (lastUser) {
			staffId = (parseInt(lastUser["staff_id"]) + 1).toString().padStart(7, "0");
		}

		fields.push("staff_id");
		values.push(staffId);
	}

	if (postal_code !== null) {
		return await utils.insert(pool, postal_code + '_' + table, fields, values);
	}
	
	return await utils.insert(pool, table, fields, values);
};

const getManyStaffs = async (fields, values) => {
  	return await utils.find(pool, table, fields, values);
};

const getOneStaff = async (fields, values) => {
  	return await utils.findOne(pool, table, fields, values);
};

const updateStaff = async (fields, values, conditionFields, conditionValues) => {
  	return await utils.update(pool, table, fields, values, conditionFields,conditionValues);
};

const deleteStaff = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	console.log(fields);
  	return await utils.deleteOne(pool, table, fields, values);
};

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
	await utils.update(pool, table, fields, values, conditionFields, conditionValues);
};

module.exports = {
    checkExistStaff,
    createNewStaff,
    getOneStaff,
    getManyStaffs,
    updateStaff,
    deleteStaff,
	updatePassword,
};
