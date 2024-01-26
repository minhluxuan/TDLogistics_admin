const mysql = require("mysql2");
const utils = require("./utils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const table = "agency";

const pool = mysql.createPool(dbOptions).promise();

const checkExistAgency = async (fields, values) => {
	const result = await utils.findOne(pool, table, fields , values);
	return result.length > 0;
}

const generateAgencyID = async (level, province, district) => {
	let suffix;
	let postalCode;
	let acronym;
	const provinceTable = "province";
	const districtTable = "district";
	try {
		const provinceInfo = await utils.findOne(pool, provinceTable, ["province"], [province]);
		const districtInfo = await utils.findOne(pool, districtTable, ["district"], [district]);
		//console.log(provinceInfo, districtInfo);
		if(level === 1) {
			// Tổng cục
			suffix = "AG";
			postalCode = provinceInfo[0]["postalcode"];
		} else if(level === 2) {
			// Bưu cục cấp tỉnh
			suffix = "AP";
			postalCode = provinceInfo[0]["postalcode"];
		} else if(level === 3) {
			// Bưu cục cấp huyện
			suffix = "AD";
			postalCode = districtInfo[0]["postalcode"];
		} else if(level === 4) {
			// Bưu cục cấp thị trấn 
			suffix = "AT";
			postalCode = districtInfo[0]["postalcode"];
		} else {
			throw new Error("Cấp bậc bưu cục không hợp lệ!")
		}
		acronym = provinceInfo[0]["acronym"];
		//console.log(postalCode, acronym);
		const agencyID = suffix + "_" + acronym + "_" + postalCode + "_" + "00000";

		const result = {
			agency_id: agencyID,
			postal_code: postalCode
		}
		return result;
	} catch (error) {
		console.log("Error: ", error);
		throw new Error(error.message);
	}
	
}

const createTableForAgency = async (postal_code) => {
	const staffsTable = postal_code + "_staffs";
	const ordersTable = postal_code + "_orders";
	const shipmentTable = postal_code + "_shipment";

	const createStaffsTable = `CREATE TABLE ${staffsTable} AS SELECT * FROM staff WHERE 1 = 0`;
	const createOrdersTable = `CREATE TABLE ${ordersTable} AS SELECT * FROM orders WHERE 1 = 0`;
	const createShipmentTable = `CREATE TABLE ${shipmentTable} AS SELECT * FROM shipment WHERE 1 = 0`;

	try {
		await pool.query(createStaffsTable);
		await pool.query(createOrdersTable);
		await pool.query(createShipmentTable);
	} catch (error) {
		console.log("Error: ", error);
		throw new Error(error.message);
	}

}

const dropTableForAgency = async (postal_code) => {
	const staffsTable = postal_code + "_staffs";
	const ordersTable = postal_code + "_orders";
	const shipmentTable = postal_code + "_shipment";

	const dropStaffsTable = `DROP TABLE ${staffsTable}`;
	const dropOrdersTable = `DROP TABLE ${ordersTable}`;
	const dropShipmentTable = `DROP TABLE ${shipmentTable}`;

	try {
		await pool.query(dropStaffsTable);
		await pool.query(dropOrdersTable);
		await pool.query(dropShipmentTable);
	} catch (error) {
		console.log("Error: ", error);
		throw new Error(error.message);
	}

}

const locateAgencyInArea = async (choice, agency_id) => {
	let locateTable;
	const agencyID = agency_id.split('_');
	const level = agencyID[0];
	const location = agencyID[2];
	try {
		if(level === "AG" || level === "AP") {
			locateTable = "province";
		} else if(level === "AD" || level === "AT") {
			locateTable = "district";
		} else {
			throw new Error ("Cấp bậc bưu cục không hợp lệ!");
		} 

		if(choice === 0) {
			// choice = 0 means delete agency
			// then free the location of agency
			const query = `UPDATE ${locateTable} SET agency_id = null WHERE postalcode = ?`;
			const result = await pool.query(query, location);
			return result[0];
		} else if(choice === 1) {
			// chioce = 1 mmeans create new agency
			// then set location of agency
			const query = `UPDATE ${locateTable} SET agency_id = ? WHERE postalcode = ?`;
			const result = await pool.query(query, [agency_id, location]);
			return result[0];
		} else {
			throw new Error("Lựa chọn không hợp lệ!");
		}

	} catch (error) {
		console.log("Error: ", error);
		throw new Error(error.message);
	}
}

const getOneAgency = async (fields, values) => {
    return await utils.findOne(pool, table, fields, values);
};

const getManyAgencies = async (fields, values) => {
	return await utils.find(pool, table, fields, values);
};

const createNewAgency = async (fields, values) => {
	return await utils.insert(pool, table, fields, values);
}

const updateAgency = async (fields, values, conditionFields, conditionValues) => {
	return await utils.update(pool, table, fields, values, conditionFields, conditionValues);
};

const deleteAgency= async(fields, values) => {
	return await utils.deleteOne(pool, table, fields, values);
};

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
  await utils.update(pool, table, fields, values, conditionFields, conditionValues);
};


module.exports = { 
	checkExistAgency,
	generateAgencyID,
	createTableForAgency,
	dropTableForAgency,
	locateAgencyInArea,
    getOneAgency,
	getManyAgencies,
	createNewAgency,
	deleteAgency,
	updatePassword,
	updateAgency,
};