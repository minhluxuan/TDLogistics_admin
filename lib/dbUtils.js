const findOneUnion = async (pool, table, fields, values) => {
    let query;
    if (!fields || !values || fields.length === 0 || values.length === 0) {
        query = `SELECT * FROM ${table}`;
    }
    else {
        query = `SELECT * FROM ${table} WHERE ${fields.map(field => `${field} = ?`).join(" OR ")} LIMIT 1`;
    }

    const result = await pool.query(query, values);
    return result[0];
}

const findOneIntersect = async (pool, table, fields, values) => {
    let query;
    if (!fields || !values || fields.length === 0 || values.length === 0) {
        query = `SELECT * FROM ${table}`;
    }
    else {
        query = `SELECT * FROM ${table} WHERE ${fields.map(field => `${field} = ?`).join(" AND ")} LIMIT 1`;
    }

    const result = await pool.query(query, values);
    return result[0];
}

const find = async (pool, table, fields = null, values = null) => {
    if (fields !== null && values !== null) {
        const whereClause =  fields.map(field => `${field} = ? `).join(' AND ');
        query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    }
    else {
        query = `SELECT * FROM ${table}`;
    }

    const result = await pool.query(query, values);
    return result[0];
}

const insert = async (pool, table, fields, values) => {
    const query = `INSERT INTO ${table} (${fields.map(field => `${field}`)}) VALUES (${fields.map(field => `?`)})`;
    const result = await pool.query(query, values);
    return result[0];
    
}

const updateOne = async (pool, table, fields, values, conditionFields, conditionValues) => {
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const whereClause = conditionFields.map(conditionField => `${conditionField} = ?`).join(" AND ");
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} LIMIT 1`;

    const result = await pool.query(query, [...values, ...conditionValues]);
    return result[0];
}

const update = async (pool, table, fields, values, conditionFields, conditionValues) => {
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const whereClause = conditionFields.map(conditionField => `${conditionField} = ?`).join(" AND ");
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    const result = await pool.query(query, [...values, ...conditionValues]);
    return result[0];
}

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
}

const deleteOne = async (pool, table, fields, values) =>
{
    const whereClause =  fields.map(field => `${field} = ? `).join(' AND ');
    const query = `DELETE FROM ${table} WHERE ${whereClause} LIMIT 1`;

    const result = await pool.query(query, values);
    return result[0];
}

const deleteMany = async  (pool, table, fields = null, values = null) => {
    let query;
    if (fields.length > 0 && values.length > 0) {
        const whereClause =  fields.map(field => `${field} = ?`).join(' AND ');
        query = `DELETE FROM ${table} WHERE ${whereClause}`;
    }
    else {
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
}

const showTables = async (pool, prefix) => {
    const query = "SHOW TABLES LIKE ?";
    return (await pool.query(query, [`%${prefix}%`]));
}

const checkExistTableWithPostalCode = async (pool, postal_code) => {
    const query = "SHOW TABLES LIKE ?";
    const result = await pool.query(query, [`%${postal_code}%`]);

    if (!result || result[0].length <= 0) {
        return new Object({
            existed: false,
            message: `Bảng có tiền tố ${postal_code} không tồn tại.`,
        });
    }

    const tablesArray = result[0];

    for (const tableObject of tablesArray) {
        const table = Object.values(tableObject)[0];
        const tableNameSubParts = table.split('_');

        if (typeof tableNameSubParts === "object") {
            if (tableNameSubParts[0] === postal_code) {
                return new Object({
                    existed: true,
                    message: `Bảng "${table}" với tiền tố ${postal_code} đã tồn tại. Vui lòng kiểm tra lại.`
                });
            }
        }
    }

    return new Object({
        existed: false,
        message: `Bảng có t ${postal_code} không tồn tại.`,
    });
}

const checkExistTable = async (pool, table) => {
    const query = "SHOW TABLES LIKE ?";
    const result = await pool.query(query, [table]);

    if (!result || result[0].length <= 0) {
        return new Object({
            existed: false,
            message: `Bảng ${table} không tồn tại.`,
        });
    }

    return new Object({
        existed: true,
        message: `Bảng ${table} đã tồn tại.`,
    });
}

const dropTable = async (pool, table) => {
    const query = `DROP TABLE ${table}`;
    await pool.query(query);

    const existed = (await checkExistTable(pool, table)).existed;

    if (existed) {
        return new Object({
            success: false,
            message: `Xóa bảng ${table} thất bại.`
        });
    }

    return new Object({
        success: true,
        message: `Xóa bảng ${table} thành công.`
    });
}

const getPostalCode = (personnel_id) => {
    return personnel_id.split("_")[2];
}

const getInfo = (personnel_id) => {
    let table, conditionField;
    const postalCode = personnel_id.split("_")[2];
    switch (personnel_id.slice(0, 2)) {
        case "SG":
            table = "staff";
            conditionField = "staff_id";
            break;
        case "AP":
            table = postalCode + '_' + suffixAgencyTable;
            conditionField = "agency_id";
            break;
        case "SP":
            table = postalCode + '_' + suffixStaffTable;
            conditionField = "staff_id";
            break;
        case "AD":
            table = postalCode + '_' + suffixAgencyTable;
            conditionField = "agency_id";
            break;
        case "SD":
            table = postalCode + '_' + suffixStaffTable;
            conditionField = "staff_id";
            break;
        case "AT": 
            table = postalCode + '_' + suffixAgencyTable;
            conditionField = "agency_id";
            break;
        case "ST":
            table = postalCode + '_' + suffixStaffTable;
            conditionField = "staff_id";
            break;
        default:
            table = undefined;
            conditionField = undefined;
            break;
    }

    return {
        table: table,
        conditionField: conditionField,
    }
}

module.exports = {
    findOneUnion,
    findOneIntersect,
    find,
    insert,
    updateOne,
    update,
    getLastRow,
    deleteOne,
    deleteMany,
    showTables,
    getPostalCode,
    checkExistTable,
    dropTable,
    checkExistTableWithPostalCode,
    getInfo,
}
