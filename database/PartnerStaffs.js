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

const checkExistPartnerStaff = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
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
};

const createNewPartnerStaff = async (info) => {
  const fields = Object.keys(info);
  const values = Object.values(info);


  return await dbUtils.insert(pool, table, fields, values);
};

const getManyPartnerStaffs = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	const result = await dbUtils.find(pool, table, fields, values);
	return result;
	};

const getOnePartnerStaff = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.findOneIntersect(pool, table, fields, values);
};

const updatePartnerStaff = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);

	return await dbUtils.updateOne(pool, table, fields, values, conditionFields, conditionValues);
};

const deletePartnerStaff = async (conditions) => {
	const fields = Object.keys(conditions);
	const values = Object.values(conditions);

	return await dbUtils.deleteOne(pool, table, fields, values);
};

const updatePartnerPassword = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);

	return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
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
