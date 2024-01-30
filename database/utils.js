const findOne = async (pool, table, fields, values) => {
    const query = `SELECT * FROM ${table} WHERE ${fields.map(field => `${field} = ?`).join(" OR ")} LIMIT 1`;

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
}

const find = async (pool, table, fields = null, values = null) => {
    let query;

    if (fields !== null && values !== null) {
        const whereClause =  fields.map(field => `${field} = ? `).join(' AND ');
        query = `SELECT * FROM ${table} WHERE ${whereClause}`;
    }
    else {
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
}

const insert = async (pool, table, fields, values) => {
    const query = `INSERT INTO ${table} (${fields.map(field => `${field}`)}) VALUES (${fields.map(field => `?`)})`;
    
    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error) {
        console.log("Error: ", error.message);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
}

const updateOne = async (pool, table, fields, values, conditionFields, conditionValues) => {
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const whereClause = conditionFields.map(conditionField => `${conditionField} = ?`).join(" AND ");
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} LIMIT 1`;

    try {
        const result = await pool.query(query, [...values, ...conditionValues]);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
}

const update = async (pool, table, fields, values, conditionFields, conditionValues) => {
    const setClause = fields.map(field => `${field} = ?`).join(", ");
    const whereClause = conditionFields.map(conditionField => `${conditionField} = ?`).join(" AND ");
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    try {
        const result = await pool.query(query, [...values, ...conditionValues]);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
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

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result;
    } 
    catch (error) {
        console.log("Error: ", error);
        throw new Error("Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!");
    }
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

const showTables = async (pool, table) => {
    const query = "SHOW TABLES LIKE ?";
    return (await pool.query(query, [`%${table}%`]))[0];
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
    findOne,
    find,
    insert,
    updateOne,
    update,
    getLastRow,
    deleteOne,
    deleteMany,
    showTables,
    getPostalCode,
    getInfo,
}
