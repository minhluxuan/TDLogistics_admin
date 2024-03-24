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

const table = "agency_company";

const pool = mysql.createPool(dbOptions).promise();

const createNewAgencyCompany = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	return await dbUtils.insert(pool, table, fields, values);
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

const deleteAgencyCompany= async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.deleteOne(pool, table, fields, values);
};

const checkExistAgencyCompany = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	const result = await dbUtils.findOneUnion(pool, table, fields, values);

	if (!result) {
		throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút.");
	}

	if (result.length === 0) {
		return new Object({
			existed: false,
			message: "Doanh nghiệp chưa tồn tại.",
		});
	}

	for (let i = 0; i < fields.length; i++) {
		if (result[0][fields[i]] === values[i]) {
			return new Object({
				existed: true,
				message: `Doanh nghiệp có ${fields[i]}: ${values[i]} đã tồn tại.`,
			});
		}
	}
};

module.exports = {
    createNewAgencyCompany,
    updateAgencyCompany,
    getOneAgencyCompany,
    deleteAgencyCompany,
    checkExistAgencyCompany
}