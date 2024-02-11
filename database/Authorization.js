const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");
const auth = require("../lib/auth");

const dbOptions = {
	host: process.env.HOST,
	port: process.env.DBPORT,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
};

const pool = mysql.createPool(dbOptions).promise();
const authorizationTable = "authorization";
const staffTable = "staff";

const getPermissionByRole = async (role) => {
    return await dbUtils.findOneIntersect(pool, authorizationTable, ["role"], [role]);
}

const grantPermissions = async (staffId, givenPermissions, postalCode) => {
    if (postalCode) {
        return await dbUtils.updateOne(pool, postalCode + '_' + staffTable, ["privileges"], [JSON.stringify(givenPermissions)], ["staff_id"], [staffId]);
    }

    return await dbUtils.updateOne(pool, staffTable, ["privileges"], [JSON.stringify(givenPermissions)], ["staff_id"], [staffId]);
}

const revokePermissions = async (staffId, revokedPermissions, postalCode) => {
    if (postalCode) {
        return await dbUtils.updateOne(pool, postalCode + '_' + staffTable, ["privileges"], [JSON.stringify(revokedPermissions)], ["staff_id"], [staffId]);
    }

    return await dbUtils.updateOne(pool, staffTable, ["privileges"], [JSON.stringify(revokePermissions)], ["staff_id"], [staffId]);
}

module.exports = {
    getPermissionByRole,
    grantPermissions,
    revokePermissions,
}