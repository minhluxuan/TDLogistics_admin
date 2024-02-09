const mysql = require("mysql2");
const dbUtils = require("../lib/dbUtils");
const { object } = require("joi");
const { initialize } = require("passport");
const { findOneIntersect } = require("../lib/dbUtils");

const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

const table = "transport_partner";

const pool = mysql.createPool(dbOptions).promise();

process.on("SIGINT", () => {
    pool.end()
        .then(() => {
            console.log("Database connection closed");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Error closing database connection", err);
            process.exit(1);
        });
});

const createNewPartner = async (info, staff_id) => {
    const fields = Object.keys(info);
    const values = Object.values(info);
    fields.push("transport_partner_id");
    values.push(transportPartnerId);

    return await dbUtils.insert(pool, table, fields, values);
};

const checkExistPartner = async (info) => {
    const fields = Object.keys(info);
    const values = object.value(info);
    const result = await dbUtils.findOne(pool, table, fields, values);
    return result.length > 0;
};

const getManyPartners = async (info) => {
    const fields = Object.keys(info);
    const values = object.value(info);
    return await dbUtils.find(pool, table, fields, values);
};

const getOnePartner = async (info) => {
    const fields = Object.keys(info);
    const values = object.value(info);
    return await dbUtils.findOne(pool, table, fields, values);
};

const updatePartner = async (info, conditions) => {
    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    if (info.debit) {
        const fields = Object.keys(info);
        const values = Object.values(info);
        const index = fields.indexOf("debit");
        if (!index) {
            return "there is a error while update with debit";
        }
        fields.splice(index, 1);
        values.splice(index, 1);
        await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
        await pool.query(`UPDATE ${table} SET debit = debit + ? WHERE ${conditionFields.join(" = ? AND ")} = ?`, [
            info.debit,
            ...conditionValues,
        ]);
        return findOneIntersect(pool, table, conditionFields, conditionValues);
    } else {
        result = await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
        return result;
    }
};

const deletePartner = async (info) => {
    const fields = Object.keys(info);
    const values = Object.values(info);
    return await dbUtils.deleteOne(pool, table, fields, values);
};

// const result = pool.query("SELECT * FROM transport_partner").then((result) => {
//     console.log(result);
// });

// createPartner(
//     ["agency_id", "transport_partner_id", "tax_code", "name", "email", "phone_number"],
//     ["agent1", "DL", "tax", "name", "emai", "0976481171"]
// );
// deletePartner(["id"], [2]);
// updatePartner(["tax_code"], ["taxipda2t"], ["transport_partner_id"], ["TC00001"]);
//console.log("here");

module.exports = {
    checkExistPartner,
    createNewPartner,
    getOnePartner,
    getManyPartners,
    updatePartner,
    deletePartner,
};
