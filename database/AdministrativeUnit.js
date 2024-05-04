const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};
const pool = mysql.createPool(dbOptions).promise();

const provinceTable = "province";
const districtTable = "district";
const wardTable = "ward";

const checkExistProvince = async (province) => {
    return (await dbUtils.findOneIntersect(pool, provinceTable, ["province"], [province])).length > 0;
}

const getOneDistributionCenter = async (province) => {
    const query = "SELECT managed_by FROM ?? WHERE ?? = ?";
    const result = (await pool.query(query, [provinceTable, "province", province]))[0];
    if (!result || result.length === 0) {
        return null;
    }

    return result[0].managed_by;
}

const getUnits = async (level, province, district) => {
    let result;
    switch (level) {
        case 1: //Search tất cả tỉnh trên Việt Nam
            result = await dbUtils.find(pool, provinceTable);
            return {
                success: true,
                data: result.map(entry => entry.province)
            }
        case 2:
            if(!province) {
                return {
                    success: false,
                    data: null,
                }
            }
            result = await dbUtils.find(pool, districtTable, ["province"], [province]);
            return {
                success: true,
                data: result.map(entry => entry.district)
            }
        case 3:
            if(!province || !district) {
                return {
                    success: false,
                    data: null,
                }
            } 
            result = await dbUtils.find(pool, wardTable, ["province", "district"], [province, district]);
            return {
                success: true,
                data: result.map(entry => entry.ward)
            }
        default: 
            return {
                success: false,
                data: null
            }
    }
}

const getOneAdministrativeUnit = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.findOneIntersect(pool, wardTable, fields, values);
}

const getAdministrativeUnit = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return await dbUtils.find(pool, wardTable, fields, values);
}

const updateOneAdministrativeUnit = async (condition, info) => {
    const conditionFields = Object.keys(condition);
    const conditionValues = Object.values(condition);
    const fields = Object.keys(info);
    const values = Object.values(info);

    return await dbUtils.updateOne(pool, wardTable, fields, values, conditionFields, conditionValues);
}

module.exports = {
    getUnits,
    getOneDistributionCenter,
    checkExistProvince,
    getOneAdministrativeUnit,
    getAdministrativeUnit,
    updateOneAdministrativeUnit,
}