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
	const result = await dbUtils.findOneUnion(pool, businessRepresentorTable, fields, values);

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

const getManyBussinessUsers = async (info, paginationConditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	const limit = paginationConditions.rows || 0;
    const offset = paginationConditions.page ? paginationConditions.page * limit : 0;

  	return await dbUtils.find(pool, table, fields, values, limit, offset);
};

const getOneBusinessUser = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  	return await dbUtils.findOneIntersect(pool, table, fields, values);
};

const getOneRepresentor = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

  	return await dbUtils.findOneIntersect(pool, "business_representor", fields, values);
}

const getManyRepresentors = async (info) => {
	if (info.hasOwnProperty("agency_id") && info.agency_id) {
		const agency_id = info.agency_id;
		delete info.agency_id;

		const fields = Object.keys(info);
		const values = Object.values(info);

		let query = `SELECT br.* FROM business_representor br JOIN business_user bu ON bu.business_id = br.business_id WHERE bu.agency_id = ?`;
		const additionClause = `AND ${fields.map(field => `br.${field} = ?`).join(" AND ")}`;
		
		if (fields.length > 0 && values.length > 0) {
			query +=  additionClause;
		}
		
		return (await pool.query(query, [agency_id, ...values]))[0];
	}

	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.find(pool, businessRepresentorTable, fields, values);
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
	getOneRepresentor,
	getManyRepresentors,
	updateBusinessUser,
	updateBusinessRepresentor,
	deleteBusinessUSer
}