const { array } = require("joi");

const findOne = async (pool, table, fields, values) => {
    const query = `SELECT * FROM ${table} WHERE ${fields.map((field) => `${field} = ?`).join(" AND ")} LIMIT 1`;

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};

const find = async (pool, table, fields = null, values = null) => {
    let query;

    if (fields !== null && values !== null) {
        const whereClause = fields.map((field) => `${field} = ? `).join(" AND ");
        query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    } else {
        query = `SELECT * FROM ${table}`;
    }

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};

const insert = async (pool, table, fields, values) => {
    const query = `INSERT INTO ${table} (${fields.map((field) => `${field}`)}) VALUES (${fields.map((field) => `?`)})`;

    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};

const update = async (pool, table, fields, values, conditionFields, conditionValues) => {
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const whereClause = conditionFields.map((conditionField) => `${conditionField} = ?`).join(" AND ");

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    try {
        const result = await pool.query(query, [...values, ...conditionValues]);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};

const getLastRow = async (pool, table) => {
    const query = `SELECT * FROM ?? ORDER BY id DESC LIMIT 1`;

    try {
        const result = await pool.query(query, [table]);

        if (result.length > 0) {
            return result[0][0];
        }

        return null;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};

const deleteOne = async (pool, table, fields, values) => {
    const whereClause = fields.map((field) => `${field} = ? `).join(" AND ");
    const query = `DELETE FROM ${table} WHERE ${whereClause} LIMIT 1`;

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};

const deleteMany = async (pool, table, fields = null, values = null) => {
    let query;
    if (fields.length > 0 && values.length > 0) {
        const whereClause = fields.map((field) => `${field} = ?`).join(" AND ");
        query = `DELETE FROM ${table} WHERE ${whereClause}`;
    } else {
        query = `DELETE FROM ${table}`;
    }

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
};
/*
In the database, the journey has the form of a json:
{
    value: [
    {
        status: "string1",
        date: datetime1,
    },
    {
        status: "string2",
        date: datetime2,
    },
}
*/
//appending a new JSON object to the JSON array at the path $.${arrayName} in the JSON document in the fields column.
class jsonArray {
    append = async (pool, table, fields, arrayName, newValues, conditionFields, conditionValues) => {
        for (let i = 0; i < newValues.length; i++) {
            const query = `UPDATE ?? SET ?? = JSON_ARRAY_APPEND(??, '$.${arrayName}', "${newValues[i]}") WHERE ?? = ?`;
            try {
                const result = await pool.query(query, [table, fields, fields, conditionFields, conditionValues]);
                console.log(result);
            } catch (err) {
                console.log(err);
                throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
            }
        }
    };
    replace = async (pool, table, fields, arrayName, oldvalues, newvalues, conditionFields, conditionValues) => {
        for (let i = 0; i < oldvalues.length; i++) {
            // Find the path to the value
            const pathQuery = `SELECT JSON_SEARCH(??, 'one', ?) AS path FROM ?? WHERE ?? = ?`;
            const [rows] = await pool.query(pathQuery, [fields, oldvalues[i], table, conditionFields, conditionValues]);
            const path = rows[0].path;

            if (path === null) {
                console.log(`Value ${oldvalues[i]} not found in JSON array ${arrayName}`);
                continue;
            }

            // Replace the value
            const replaceQuery = `UPDATE ?? SET ?? = JSON_REPLACE(??, ?, ?) WHERE ?? = ?`;
            const result = await pool.query(replaceQuery, [
                table,
                fields,
                fields,
                path,
                newvalues[i],
                ...conditionFields,
                ...conditionValues,
            ]);

            console.log(result);
        }
    };
    delete = async (pool, table, field, arrayName, order, conditionFields, conditionValues) => {
        for (let i = 0; i < order.length; i++) {
            const pathQuery = `SELECT JSON_SEARCH(??, 'one', ?) AS path FROM ?? WHERE ?? = ?`;
            const [rows] = await pool.query(pathQuery, [field, order[i], table, conditionFields, conditionValues]);
            const path = rows[0].path;

            if (path === null) {
                console.log(`Value ${order[i]} not found in JSON array ${arrayName}`);
                continue;
            }

            const deleteQuery = `UPDATE ?? SET ?? = JSON_REMOVE(??,?) WHERE ?? = ?`;
            const result = await pool.query(deleteQuery, [
                table,
                field,
                field,
                path,
                ...conditionFields,
                ...conditionValues,
            ]);
        }
    };
}
module.exports = {
    findOne,
    find,
    insert,
    update,
    getLastRow,
    deleteOne,
    deleteMany,
    jsonArray,
};
