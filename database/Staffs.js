const mysql = require("mysql2");
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
	const result = await dbUtils.findOneUnion(pool, table, fields, values);

	if (!result) {
		throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút.");
	}

	if (result.length === 0) {
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

const checkExistStaffIntersect = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	const result = await dbUtils.findOneIntersect(pool, table, fields, values);

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

	if (postal_code !== null) {
		return await dbUtils.insert(pool, postal_code + '_' + table, fields, values);
	}
	
	return await dbUtils.insert(pool, table, fields, values);
};

const getManyStaffs = async (info, paginationConditions, postal_code) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	const limit = paginationConditions.rows || 0;
    const offset = paginationConditions.page ? paginationConditions.page * limit : 0;
	
	let query;
	if (!postal_code) {
		if (fields.length === 0 || values.length === 0) {
			query = `SELECT role, agency_id, username, phone_number, email, fullname, date_of_birth, cccd, province, district, town, detail_address, staff_id, position, bin, bank, deposit, salary, paid_salary, active FROM staff ORDER BY created_at DESC`;
			if (offset && typeof offset === "number") {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` LIMIT ?, ?`;
					values.push(offset, limit);
				}
			}
			else {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` LIMIT ?`;
					values.push(limit);
				}
			}
		}
		else {
			query = `SELECT role, agency_id, username, phone_number, email, fullname, date_of_birth, cccd, province, district, town, detail_address, staff_id, position, bin, bank, deposit, salary, paid_salary, active FROM staff WHERE ${fields.map(field => `${field} = ?`).join(" AND ")} ORDER BY created_at DESC`;
			if (offset && typeof offset === "number") {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` LIMIT ?, ?`;
					values.push(offset, limit);
				}
			}
			else {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` LIMIT ?`;
					values.push(limit);
				}
			}
		}
	}
	else {
		if (fields.length === 0 || values.length === 0) {
			query = `SELECT role, agency_id, username, phone_number, email, fullname, date_of_birth, cccd, province, district, town, detail_address, staff_id, position, bin, bank, deposit, salary, paid_salary, active FROM ${postal_code + '_' + "staff"} ORDER BY created_at DESC`;
			if (offset && typeof offset === "number") {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` LIMIT ?, ?`;
					values.push(offset, limit);
				}
			}
			else {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` LIMIT ?`;
					values.push(limit);
				}
			}
		}
		else {
			query = `SELECT role, agency_id, username, phone_number, email, fullname, date_of_birth, cccd, province, district, town, detail_address, staff_id, position, bin, bank, deposit, salary, paid_salary, active FROM ${postal_code + '_' + "staff"} WHERE ${fields.map(field => `${field} = ?`).join(" AND ")} ORDER BY created_at DESC`;
			if (offset && typeof offset === "number") {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` AND LIMIT ?, ?`;
					values.push(offset, limit);
				}
			}
			else {
				if (limit && typeof limit === "number" && limit > 0) {
					query += ` AND LIMIT ?`;
					values.push(limit);
				}
			}
		}
	}

	const result = await pool.query(query, values);
	return result[0];
};

const getOneStaff = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);console.log(fields, values);

  	return await dbUtils.findOneIntersect(pool, table, fields, values);
};

const updateStaff = async (info, conditions, postalCode = null) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);console.log(fields, values);

	if (fields.length === 0 || values.length === 0 || conditionFields.length === 0 || conditionValues.length === 0) {
		return new Object({
			affectedRows: 0,
		});
	}

	if (postalCode) {
		return await dbUtils.updateOne(pool, postalCode + '_' + table, fields, values, conditionFields, conditionValues);
	}

  	return await dbUtils.updateOne(pool, table, fields, values, conditionFields, conditionValues);
};

const deleteStaff = async (conditions, postalCode = null) => {
	const fields = Object.keys(conditions);
	const values = Object.values(conditions);console.log(fields, values);

	if (postalCode) {
		return await dbUtils.deleteOne(pool, postalCode + '_' + table, fields, values);
	}

  	return await dbUtils.deleteOne(pool, table, fields, values);
};

const updatePassword = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);
	
	return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

module.exports = {
    checkExistStaff,
	checkExistStaffIntersect,
    createNewStaff,
    getOneStaff,
    getManyStaffs,
    updateStaff,
    deleteStaff,
	updatePassword,
};
