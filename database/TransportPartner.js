const mysql = require("mysql2");
const utils = require("./utils");

//const jsonArray = new utils.jsonArray();
const dbOptions = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "admin",
    database: "tdlogistics",
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
const createNewPartner = async (fields, values) => {
    const prefix = values[fields.indexOf("transport_partner_id")];
    const [rows] = await pool.query(
        `SELECT transport_partner_id FROM ${table} WHERE transport_partner_id LIKE ? ORDER BY transport_partner_id DESC LIMIT 1`,
        [`${prefix}%`]
    );
    let newId;
    if (rows.length > 0) {
        const latestId = rows[0].transport_partner_id;
        const latestNumber = parseInt(latestId.slice(prefix.length));
        const newNumber = latestNumber + 1;
        const newNumberString = newNumber.toString().padStart(5, "0");
        newId = prefix + newNumberString;
    } else {
        newId = prefix + "00000";
    }
    values[fields.indexOf("transport_partner_id")] = newId;

    return await utils.insert(pool, table, fields, values);
};

const checkExistPartner = async (fields, values) => {
    const result = await utils.findOne(pool, table, fields, values);
    return result.length > 0;
};
const getManyPartners = async (fields, values) => {
    return await utils.find(pool, table, fields, values);
};

const getOnePartner = async (fields, values) => {
    return await utils.findOne(pool, table, fields, values);
};
const updatePartner = async (fields, values, conditionFields, conditionValues) => {
    const debitIndex = fields.indexOf("debit");

    if (debitIndex !== -1) {
        await pool.query(`UPDATE ${table} SET debit = debit + ? WHERE ${conditionFields.join(" = ? AND ")} = ?`, [
            values[debitIndex],
            ...conditionValues,
        ]);

        fields = fields.filter((field) => field !== "debit");
        values = values.filter((value, index) => index !== debitIndex);
    }

    if (fields.length > 0) {
        result = await utils.update(pool, table, fields, values, conditionFields, conditionValues);
        return result;
    }

    // const [updatedRows] = await pool.query(
    //     `SELECT * FROM ${table} WHERE ${conditionFields.join(" = ? AND ")} = ?`,
    //     conditionValues
    // );
    // return updatedRows[0];
};

const deletePartner = async (fields, values) => {
    return await utils.deleteOne(pool, table, fields, values);
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
