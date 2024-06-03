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
	
	const result = await dbUtils.findOneUnion(pool, table, fields , values);
	return result.length > 0;
}

const checkPostalCode = async (province, district, postal_code) => {
	const successPostalCode = await checkExistAgency({ postal_code: postal_code });
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

	const resultFindingDistrict = await dbUtils.findOneIntersect(pool, "district", ["province", "district"], [province, district]);
	if (!resultFindingDistrict || resultFindingDistrict.length <= 0) {
		return new Object({
			success: false,
			message: `${district}, ${province} không tồn tại.`,
		});
	}

	const postalCodeOfDistrictFromDatabase = resultFindingDistrict[0].postal_code;

	if (!postalCodeOfDistrictFromDatabase || postalCodeOfDistrictFromDatabase.slice(0, 4) !== postal_code.slice(0, 4)) {
		return new Object({
			success: false,
			message: `${district}, ${province} không khớp với mã bưu chính ${postal_code}.`,
		});
	}

	return new Object({
		success: true,
		message: "Mã bưu chính hợp lệ.",
	});
}

const checkWardsOccupation = async (province, district, wards) => {
	for (const ward of wards) {
		const resultFindingWard = await dbUtils.findOneIntersect(pool, "ward", ["province", "district", "ward"], [province, district, ward]); //tai sao lai intersect o day???xd
		if (!resultFindingWard || resultFindingWard.length <= 0) {
			return new Object({
				success: false,
				message: `${ward} không tồn tại.`
			});
		}

		const occupierAgencyId = resultFindingWard[0].agency_id;
		if (occupierAgencyId && (new RegExp(process.env.REGEX_PERSONNEL)).test(occupierAgencyId)) {
			return new Object({
				success: false,
				message: `${ward} đã được quản lý bởi đại lý/bưu cục có mã đại lý ${occupierAgencyId}.`,
			});
		}
	}

	return new Object({
		success: true,
		message: "Tất cả các phường xã chưa được quản lý bởi bưu cục/đại lý nào.",
	});
}


const createTablesForAgency = async (postal_code) => {
	const ordersTable = postal_code + "_orders";
	const shipmentTable = postal_code + "_shipment";
	const shipperTasksTable = postal_code + "_shipper_tasks";
	const driverTasksTable = postal_code + "_driver_tasks";
	const scheduleTable = postal_code + "_schedule";

	const createOrdersTable = `CREATE TABLE ${ordersTable} AS SELECT * FROM orders WHERE 1 = 0`;
	const createShipmentTable = `CREATE TABLE ${shipmentTable} AS SELECT * FROM shipment WHERE 1 = 0`;
	const createShipperTasksTable = `CREATE TABLE ${shipperTasksTable} (
		id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
		order_id varchar(30) NOT NULL,
		staff_id varchar(25) NOT NULL,
		created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
		completed_at datetime DEFAULT NULL,
		completed tinyint(1) NOT NULL
	  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;`
	const createDriverTasksTable = `CREATE TABLE ${driverTasksTable} AS SELECT * FROM driver_tasks WHERE 1 = 0`;
	const createScheduleTable = `CREATE TABLE ${scheduleTable} AS SELECT * FROM schedule WHERE 1 = 0`;

	await pool.query(createOrdersTable);
	await pool.query(createShipmentTable);
	await pool.query(createShipperTasksTable);
	await pool.query(createScheduleTable);
	await pool.query(createDriverTasksTable);

	const checkingExistOrdersTable = await dbUtils.checkExistTable(pool, ordersTable);
	const checkingExistShipmentTable = await dbUtils.checkExistTable(pool, shipmentTable);
	const checkingExistShipperTasksTable = await dbUtils.checkExistTable(pool, shipperTasksTable);
	const checkingExistDriverTasksTable = await dbUtils.checkExistTable(pool, driverTasksTable);
	const checkingExistScheduleTable = await dbUtils.checkExistTable(pool, scheduleTable);

	const neccessaryTable = [ordersTable, shipmentTable, shipperTasksTable, scheduleTable];
	const successCreatedTable = new Array();

	if (checkingExistOrdersTable.existed) {
		successCreatedTable.push(ordersTable);
	}

	if (checkingExistShipmentTable.existed) {
		successCreatedTable.push(shipmentTable);
	}

	if (checkingExistShipperTasksTable.existed) {
		successCreatedTable.push(shipperTasksTable);
	}

	if (checkingExistDriverTasksTable.existed) {
		successCreatedTable.push(driverTasksTable);
	}

	if (checkingExistScheduleTable.existed) {
		successCreatedTable.push(scheduleTable);
	}

	const addPrimaryKeyForOrdersTableQuery = `ALTER TABLE ${ordersTable} ADD PRIMARY KEY (order_id)`;
	const addForeignKeyForOrdersTableQuery = `ALTER TABLE ${ordersTable} ADD CONSTRAINT fk_${ordersTable}_order_id FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE`;
	const addPrimaryKeyForShipperTasksTableQuery = `ALTER TABLE ${shipperTasksTable}
	ADD CONSTRAINT fk_${shipperTasksTable}_order_id_ FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE ON UPDATE CASCADE`
	const addPrimaryKeyForScheduleTableQuery = `ALTER TABLE ${scheduleTable} ADD PRIMARY KEY (id)`;
	const addPrimaryKeyForShipmentTableQuery = `ALTER TABLE ${shipmentTable} ADD PRIMARY KEY (shipment_id)`;
	const addPrimaryKeyForDriverTasksTableQuery = `ALTER TABLE ${driverTasksTable} ADD PRIMARY KEY (id)`;

	await pool.query(addPrimaryKeyForOrdersTableQuery);
	await pool.query(addForeignKeyForOrdersTableQuery);
	await pool.query(addPrimaryKeyForShipperTasksTableQuery);
	await pool.query(addPrimaryKeyForScheduleTableQuery);
	await pool.query(addPrimaryKeyForShipmentTableQuery);
	await pool.query(addPrimaryKeyForDriverTasksTableQuery);

	if (successCreatedTable.length < 5) {
		const missedTable = neccessaryTable.filter(table => !successCreatedTable.includes(table));

		return new Object({
			success: false,
			message: `
			Tạo tất cả bảng cần thiết cho một bưu cục/đại lý không thành công. Các bảng đã được tạo là: ${successCreatedTable.join(", ")}.\n
			Vui lòng tạo trong cơ sở dữ liệu tổng một cách thủ công các bảng: ${missedTable.join(", ")}.`,
		});
	}

	return new Object({
		success: true,
		message: `Tạo tất cả bảng cần thiết cho một bưu cục/đại lý thành công. Các bảng đã được tạo là: ${successCreatedTable.join(", ")}.`,
	});
}

const dropTableForAgency = async (postal_code) => {
	const ordersTable = postal_code + "_orders";
	const shipmentTable = postal_code + "_shipment";
	const shipperTasksTable = postal_code + "_shipper_tasks";
	const driverTasksTable = postal_code + "_driver_tasks";
	const scheduleTable = postal_code + "_schedule";

	const resultDroppingOrdersTable = await dbUtils.dropTable(pool, ordersTable);
	const resultDroppingShipmentTable = await dbUtils.dropTable(pool, shipmentTable);
	const resultDroppingShippersTasksTable = await dbUtils.dropTable(pool, shipperTasksTable);
	const resultDroppingDriverTasksTable = await dbUtils.dropTable(pool, driverTasksTable);
	const resultDroppingScheduleTable = await dbUtils.dropTable(pool, scheduleTable);

	const neccessaryToDropTable = [ordersTable, shipmentTable, shipperTasksTable, scheduleTable];
	const successDroppedTable = new Array();

	if (resultDroppingOrdersTable.success) {
		successDroppedTable.push(ordersTable);
	}

	if (resultDroppingShipmentTable.success) {
		successDroppedTable.push(shipmentTable);
	}

	if (resultDroppingShippersTasksTable.success) {
		successDroppedTable.push(shipperTasksTable);
	}

	if (resultDroppingDriverTasksTable.success) {
		successDroppedTable.push(driverTasksTable);
	}

	if (resultDroppingScheduleTable.success) {
		successDroppedTable.push(scheduleTable);
	}

	if (successDroppedTable.length < 5) {
		const missedTable = neccessaryToDropTable.filter(table => !successDroppedTable.includes(table));
		return new Object({
			success: false,
			message: `
			Không thể xóa tất cả các bảng của bưu cục/đại lý. Các bảng đã được xóa là ${successDroppedTable.join(", ")}.\n
			Vui lòng xóa thủ công các bảng ${missedTable.join(", ")}.`, 
		});
	}

	return new Object({
		success: true,
		message: `Xóa tất cả các bảng của một bưu cục thành công. Các bảng đã được xóa là ${successDroppedTable.join(", ")}.`, 
	});
}

const locateAgencyInArea = async (choice, province, district, wards, agency_id, postal_code) => {
	if (choice === 0) {
		const provinceSelectQuery = `SELECT ?? FROM ?? WHERE ?? = ? LIMIT 1`;
		const provinceResultSelect = await pool.query(provinceSelectQuery, ["agency_ids", "province", "province", province]);

		const agenciesOfProvince = provinceResultSelect[0][0] ? (provinceResultSelect[0][0].agency_ids ? JSON.parse(provinceResultSelect[0][0].agency_ids) : new Array()) : new Array();

		if (!agenciesOfProvince.includes(agency_id)) {
			agenciesOfProvince.push(agency_id);
		}

		const districtSelectQuery = `SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ? LIMIT 1`;
		const districtResultSelect = await pool.query(districtSelectQuery, ["agency_ids", "district", "province", province, "district", district]);

		const agenciesOfDistrict = districtResultSelect[0][0] ? (districtResultSelect[0][0].agency_ids ? JSON.parse(districtResultSelect[0][0].agency_ids) : new Array()) : new Array();

		if (!agenciesOfDistrict.includes(agency_id)) {
			agenciesOfDistrict.push(agency_id);
		}

		const provinceUpdateQuery = `UPDATE ?? SET ?? = ? WHERE ?? = ?`;
		const provinceResultUpdate = await pool.query(provinceUpdateQuery, ["province", "agency_ids", JSON.stringify(agenciesOfProvince), "province", province]);

		if (!provinceResultUpdate || provinceResultUpdate[0].affectedRows <= 0) {
			return new Object({
				success: false,
				message: `${province} không tồn tại.`,
			});
		}

		const districtUpdateQuery = `UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?`;
		const districtResultUpdate = await pool.query(districtUpdateQuery, ["district", "agency_ids", JSON.stringify(agenciesOfDistrict), "province", province, "district", district]);

		if (!districtResultUpdate || districtResultUpdate[0].affectedRows <= 0) {
			return new Object({
				success: false,
				message: `${district} không tồn tại.`,
			});
		}

		for (const ward of wards) {
			const wardUpdateQuery = `UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ? AND ?? = ? AND ?? = ?`;
			const wardResultUpdate = await pool.query(wardUpdateQuery, ["ward", "agency_id", agency_id, "postal_code", postal_code, "province", province, "district", district, "ward", ward]);

			if (!wardResultUpdate || wardResultUpdate[0].affectedRows <= 0) {
				return new Object({
					success: false,
					message: `${ward} không tồn tại.`,
				});
			}
		}
	}

	if (choice === 1) {
		const provinceSelectQuery = `SELECT ?? FROM ?? WHERE ?? = ? LIMIT 1`;
		const provinceResultSelect = await pool.query(provinceSelectQuery, ["agency_ids", "province", "province", province]);

		const agenciesOfProvince = provinceResultSelect[0][0] ? (provinceResultSelect[0][0].agency_ids ? JSON.parse(provinceResultSelect[0][0].agency_ids) : new Array()) : new Array();
		
		if (agenciesOfProvince.includes(agency_id)) {
			const deletedIndex = agenciesOfProvince.indexOf(agency_id);
			agenciesOfProvince.splice(deletedIndex, 1);
		}

		const districtSelectQuery = `SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ? LIMIT 1`;
		const districtResultSelect = await pool.query(districtSelectQuery, ["agency_ids", "district", "province", province, "district", district]);

		const agenciesOfDistrict = districtResultSelect[0][0] ? (districtResultSelect[0][0].agency_ids ? JSON.parse(districtResultSelect[0][0].agency_ids) : new Array()) : new Array();

		if (agenciesOfDistrict.includes(agency_id)) {
			const deletedIndex = agenciesOfProvince.indexOf(agency_id);
			agenciesOfDistrict.splice(deletedIndex, 1);
		}

		const provinceUpdateQuery = `UPDATE ?? SET ?? = ? WHERE ?? = ?`;
		await pool.query(provinceUpdateQuery, ["province", "agency_ids", JSON.stringify(agenciesOfProvince), "province", province]);

		const districtUpdateQuery = `UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?`;
		await pool.query(districtUpdateQuery, ["district", "agency_ids", JSON.stringify(agenciesOfDistrict), "province", province, "district", district]);

		for (const ward of wards) {
			const wardUpdateQuery = `UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ? AND ?? = ? AND ?? = ?`;
			await pool.query(wardUpdateQuery, ["ward", "agency_id", null, "postal_code", null, "province", province, "district", district, "ward", ward]);
		}
	}

	return new Object({
		success: true,
		message: "Cập nhật thông tin địa bàn hoạt động thành công.",
	});
}

const getOneAgency = async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

    return await dbUtils.findOneIntersect(pool, table, fields, values);
};

const getManyAgencies = async (info, paginationConditions) => {
	const fields = Object.keys(info) || new Array();
	const values = Object.values(info) || new Array();

	const limit = paginationConditions.rows || 0;
    const offset = paginationConditions.page ? paginationConditions.page * limit : 0;

	const result = await dbUtils.find(pool, table, fields, values, true, limit, offset);

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

	return await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

const deleteAgency= async (info) => {
	const fields = Object.keys(info);
	const values = Object.values(info);

	return await dbUtils.deleteOne(pool, table, fields, values);
};

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
  await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
};

const getAgencyManagedWards = async (agency_id) => {
	const query = "SELECT managed_wards FROM ?? WHERE ?? = ?";
	const result = (await pool.query(query, [table, "agency_id", agency_id]))[0];

	for (const elm of result) {
		if (elm.managed_wards) {
			try {
				elm.managed_wards = JSON.parse(elm.managed_wards);
			} catch (error) {
				elm.managed_wards = new Array();
			}
		}
	}

	return result;
}

module.exports = { 
	checkExistAgency,
	checkPostalCode,
	checkWardsOccupation,
	createTablesForAgency,
	dropTableForAgency,
	locateAgencyInArea,
    getOneAgency,
	getManyAgencies,
	createNewAgency,
	deleteAgency,
	updatePassword,
	updateAgency,
	getAgencyManagedWards,
};