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

const table = "agency";

const pool = mysql.createPool(dbOptions).promise();

const checkExistAgency = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	
	const result = await dbUtils.findOne(pool, table, fields , values);
	return result.length > 0;
}

const checkPostalCode = async (level, province, district, postal_code) => {
	const successPostalCode = await checkExistAgency({ postal_code: postal_code });console.log(successPostalCode);
	if (successPostalCode) {
		return new Object({
			success: false,
			message: `Bưu cục/đại lý có mã bưu chính ${postal_code} đã tồn tại.`,
		});
	}

	const checkingExistRelatedTable = await dbUtils.checkExistTableWithPostalCode(pool, postal_code);
	
	if (checkingExistRelatedTable.existed) {
		return new Object({
			success: false,
			message: checkingExistRelatedTable.message, 
		});
	}

	if (level === 0 || level === 1) {
		return new Object({
			success: true,
			message: "Mã bưu chính hợp lệ.",
		});
	}

	if (level === 3) {
		const result = await dbUtils.findOne(pool, "province", ["province"], [province]);

		if (!result || result.length < 0) {
			return new Object({
				success: false,
				message: "Tên tỉnh/thành phố không tồn tại.",
			});
		}

		const postalCodeFromDatabase = result[0].postal_code;

		if (postalCodeFromDatabase.slice(0, 2) !== postal_code.slice(0, 2)) {
			return new Object({
				success: false,
				message: "Tên tỉnh/thành phố không khớp với mã bưu chính.",
			});
		}

		return new Object({
			success: true,
			message: "Mã bưu chính hợp lệ.",
		});
	}

	if (level === 4 || level === 5) {
		const result = await dbUtils.findOne(pool, "district", ["district"], [district]);
		if (!result || result.length < 0) {
			return new Object({
				success: false,
				message: "Tên quận/huyện không tồn tại.",
			});
		}

		const postalCodeFromDatabase = result[0].postal_code;console.log(result[0]);

		if (postalCodeFromDatabase.slice(0, 4) !== postal_code.slice(0, 4)) {
			return new Object({
				success: false,
				message: "Tên quận/huyện không khớp với mã bưu chính.",
			});
		}

		return new Object({
			success: true,
			message: "Mã bưu chính hợp lệ.",
		});
	}

	return new Object({
		success: false,
		message: "Cấp bưu cục/đại lý không hợp lệ.",
	});
}

const generateAgencyID = async (prefix, level, postal_code) => {
	let shortenRole;
	switch (level) {
		case 1:
			shortenRole = "AG";
			break;
		case 2:
			shortenRole = "AC";
			break;
		case 3:
			shortenRole = "AP";
			break;
		case 4:
			shortenRole = "AD";
			break;
		case 5:
			shortenRole = "AT";
			break;
		default:
			return new Object({
				success: false,
				message: "Cấp bưu cục/đại lý không hợp lệ."
			});
	}

	const agencyId = prefix + "_" + shortenRole + "_" + postal_code + "_" + "00000";

	return new Object({
		success: true,
		agency_id: agencyId,
		message: "Tạo mã bưu cục thành công.",
	});
}

const createTablesForAgency = async (postal_code) => {
	const staffsTable = postal_code + "_staff";
	const ordersTable = postal_code + "_orders";
	const shipmentTable = postal_code + "_shipment";

	const createStaffsTable = `CREATE TABLE ${staffsTable} AS SELECT * FROM staff WHERE 1 = 0`;
	const createOrdersTable = `CREATE TABLE ${ordersTable} AS SELECT * FROM orders WHERE 1 = 0`;
	const createShipmentTable = `CREATE TABLE ${shipmentTable} AS SELECT * FROM shipment WHERE 1 = 0`;

	await pool.query(createStaffsTable);
	await pool.query(createOrdersTable);
	await pool.query(createShipmentTable);

	const checkingExistStaffTable = await dbUtils.checkExistTable(pool, staffsTable);
	const checkingExistOrdersTable = await dbUtils.checkExistTable(pool, ordersTable);
	const checkingExistShipmentTable = await dbUtils.checkExistTable(pool, shipmentTable);

	const successCreatedTable = new Array();

	if (checkingExistStaffTable.existed) {
		successCreatedTable.push(staffsTable);
	}

	if (checkingExistOrdersTable.existed) {
		successCreatedTable.push(ordersTable);
	}

	if (checkingExistShipmentTable.existed) {
		successCreatedTable.push(shipmentTable);
	}

	if (successCreatedTable.length !== 3) {
		return new Object({
			success: false,
			message: `Tạo tất cả bảng cần thiết cho một bưu cục/đại lý không thành công. Các bảng đã được tạo là: ${successCreatedTable.join(", ")}`,
		});
	}

	return new Object({
		success: true,
		message: `Tạo tất cả bảng cần thiết cho một bưu cục/đại lý thành công. Các bảng đã được tạo là: ${successCreatedTable.join(", ")}`,
	});
}

const dropTableForAgency = async (postal_code) => {
	const staffTable = postal_code + "_staff";
	const ordersTable = postal_code + "_orders";
	const shipmentTable = postal_code + "_shipment";

	const resultDroppingStaffTable = await dbUtils.dropTable(pool, staffTable);
	const resultDroppingOrdersTable = await dbUtils.dropTable(pool, ordersTable);
	const resultDroppingShipmentTable = await dbUtils.dropTable(pool, shipmentTable);

	const successDroppedTable = new Array();

	if (resultDroppingStaffTable.success) {
		successDroppedTable.push(staffTable);
	}

	if (resultDroppingOrdersTable.success) {
		successDroppedTable.push(ordersTable);
	}

	if (resultDroppingShipmentTable.success) {
		successDroppedTable.push(shipmentTable);
	}

	if (successDroppedTable.length !== 3) {
		return new Object({
			success: false,
			message: `Không thể xóa tất cả các bảng của một bưu cục. Các bảng đã được xóa là ${successDroppedTable.join(", ")}`, 
		});
	}

	return new Object({
		success: true,
		message: `Xóa tất cả các bảng của một bưu cục thành công. Các bảng đã được xóa là ${successDroppedTable.join(", ")}`, 
	});
}

const locateAgencyInArea = async (choice, postal_code, agency_id) => {
	if (choice === 0) {
		const selectQuery = `SELECT ?? FROM ?? WHERE postal_code LIKE ? LIMIT 1`;
		const resultSelect = await pool.query(selectQuery, ["agencies", "province", `${postal_code}%`]);

		if (!resultSelect || resultSelect[0].length <= 0) {
			throw new Error("Đã xảy ra lỗi.");
		}

		const agencies = resultSelect[0][0].agencies ? JSON.parse(resultSelect[0][0].agencies) : new Array();

		if (!agencies.includes(agency_id)) {
			agencies.push(agency_id);
		}

		const updateQuery = `UPDATE ?? SET ?? = ? WHERE ?? LIKE ?`;
		const resultUpdate = await pool.query(updateQuery, ["province", "agencies", JSON.stringify(agencies), "postal_code", `${postal_code}%`]);

		return resultUpdate;
	}

	if (choice === 1) {
		const selectQuery = `SELECT ?? FROM ?? WHERE postal_code LIKE ? LIMIT 1`;
		const resultSelect = await pool.query(selectQuery, ["agencies", "province", `${postal_code}%`]);

		if (!resultSelect || resultSelect[0].length <= 0) {
			throw new Error("Đã xảy ra lỗi.");
		}

		const agencies = resultSelect[0][0].agencies ? JSON.parse(resultSelect[0][0].agencies).filter(item => item !== agency_id) : new Array();
		const updateQuery = `UPDATE ?? SET ?? = ? WHERE ?? LIKE ?`;
		const resultUpdate = await pool.query(updateQuery, ["province", "agencies", JSON.stringify(agencies), "postal_code", `${postal_code}%`]);

		return resultUpdate;
	}
}

const getOneAgency = async (fields, values) => {
    return await dbUtils.findOne(pool, table, fields, values);
};

const getManyAgencies = async (info) => {
	const fields = Object.keys(info) || new Array();
	const values = Object.values(info) || new Array();
	const result = await dbUtils.find(pool, table, fields, values);

	for (const agency of result) {
		if (agency.hasOwnProperty("managed_areas")) {
			agency.managed_areas = JSON.parse(agency.managed_areas);
		}
	}
	
	return result;
};

const createNewAgency = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	return await dbUtils.insert(pool, table, fields, values);
}

const updateAgency = async (info, conditions) => {
	const fields = Object.keys(info);
	const values = Object.values(info);
	const conditionFields = Object.keys(conditions);
	const conditionValues = Object.values(conditions);

	return await dbUtils.update(fields, values, conditionFields, conditionValues);
};

const deleteAgency= async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.deleteOne(pool, table, fields, values);
};

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
  await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};


module.exports = { 
	checkExistAgency,
	checkPostalCode,
	generateAgencyID,
	createTablesForAgency,
	dropTableForAgency,
	locateAgencyInArea,
    getOneAgency,
	getManyAgencies,
	createNewAgency,
	deleteAgency,
	updatePassword,
	updateAgency,
};