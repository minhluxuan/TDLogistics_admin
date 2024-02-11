const mysql = require("mysql2");
const dbUtils = require("./dbUtils");

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

const createNewPartner = async (fields, values, personnel_id) => {
    const prefix = personnel_id.split('_')[0];
    const lastPartner = await dbUtils.getLastRow(pool, table);

	let transportPartnerId = prefix + "_00000";

	if (lastPartner) {
        const lastPartnerId = lastPartner["transport_partner_id"];
		transportPartnerId = prefix + (parseInt(lastPartnerId.split('_')[1]) + 1).toString();
	}

	fields.push("transport_partner_id");
	values.push(transportPartnerId);

    return await dbUtils.insert(pool, table, fields, values);
};

const checkExistPartner = async (fields, values) => {
    const result = await dbUtils.findOne(pool, table, fields, values);
    return result.length > 0;
};

const getManyPartners = async (fields, values) => {
    return await dbUtils.find(pool, table, fields, values);
};

const getOnePartner = async (fields, values) => {
    return await dbUtils.findOne(pool, table, fields, values);
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
        result = await dbUtils.update(pool, table, fields, values, conditionFields, conditionValues);
        return result;
    }
};

const deletePartner = async (fields, values) => {
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
