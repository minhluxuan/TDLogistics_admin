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

module.exports = {
    getUnits,
    checkExistProvince,
}