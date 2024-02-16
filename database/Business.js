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
const businessRepresentorTable = "business_representor";

const pool = mysql.createPool(dbOptions).promise();

const checkExistBusinessUnion = async (conditions) => {
	const fields = Object.keys(conditions);
	const values = Object.values(conditions);
	const result = await dbUtils.findOneUnion(pool, table, fields, values);

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
}

const checkExistBusiness = async (conditions) => {
	const fields = Object.keys(conditions);
	const values = Object.values(conditions);

  	const result = await dbUtils.findOneIntersect(pool, table, fields , values);
	return result.length > 0;
};

const checkExistBusinessRepresentor = async (conditions) => {
	const fields = Object.keys(conditions);
	const values = Object.values(conditions);

  	const result = await dbUtils.findOneUnion(pool, businessRepresentorTable, fields , values);
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

	return await dbUtils.insert(pool, businessRepresentorTable, fields, values);
};

const getManyBussinessUsers = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  	return await dbUtils.find(pool, table, fields, values);
};

const getOneBusinessUser = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  	return await dbUtils.findOneIntersect(pool, table, fields, values);
};

const getRepresentor = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  	return await dbUtils.findOneIntersect(pool, "business_representor", fields, values);
}

const updateBusinessUser = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);
	
	return await dbUtils.updateOne(pool, table, fields, values, conditionFields, conditionValues);
};

const updateBusinessRepresentor = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);
	
	return await dbUtils.update(pool, businessRepresentorTable, fields, values, conditionFields, conditionValues);
}

const deleteBusinessUSer= async(info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.deleteOne(pool, table, fields, values);
};

module.exports = {
	checkExistBusinessUnion,
	checkExistBusiness,
	checkExistBusinessRepresentor,
	createNewBusinessUser,
	createNewRepresentor,
	getManyBussinessUsers,
	getOneBusinessUser,
	getRepresentor,
	updateBusinessUser,
	updateBusinessRepresentor,
	deleteBusinessUSer
}