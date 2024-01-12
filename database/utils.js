const findOne = async (pool, table, fields, values) => {
    const query = `SELECT * FROM ${table} WHERE ${fields.map(field => `${field} = ?`)} LIMIT 1`;

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result[0];
    } catch (error) {
        console.log("Error: ", error);
        throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
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
        throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
    }
}

const insert = async (pool, table, fields, values) => {
    const query = `INSERT INTO ${table} (${fields.map(field => `${field}`)}) VALUES (${fields.map(field => `?`)})`;
    
    try {
        const result = await pool.query(query, values);
        return result;
    } catch (error) {
        console.log("Error: ", error);
        throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
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
        throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
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
        throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
    }
}

const deleteOne = async (pool, table, fields, values, currentTime = null) =>
{
    let query;
    const fieldCondition =  fields.map(field => `${field} = ? `).join(' AND ');
    if (currentTime !== null) 
    {
        const timeCondition = `order_time < = ${currentTime}`; 
        query = `DELETE FROM ${table} WHERE ${fieldCondition} AND ${timeCondition}  LIMIT 1`;
    }
    else
    {
        query = `DELETE FROM ${table} WHERE ${fieldCondition} LIMIT 1`;
    }

    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result;
    } 
    catch (error) {
        console.log("Error: ", error);
        throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
    }
}

const deleteMany = async  (pool, table, fields = null, values = null) => {
    let query;
    if (fields !== null && values !== null) {
      const conditions =  fields.map(field => `${field} = ? `).join(' AND ');
      query = `DELETE FROM ${table} WHERE ${conditions}`;
    }
    else {
        query = `DELETE FROM ${table}`;
    }
    
    try {
        const result = await pool.query(query, values);
        console.log("Success!");
        return result.affectedRows;
    } catch (error) {
        console.log("Error: ", error);
        throw "Đã xảy ra lỗi. Vui lòng thử lại sau ít phút!";
    }
}

module.exports = {
    findOne,
    find,
    insert,
    update,
    getLastRow,
    deleteOne,
    deleteMany,
}