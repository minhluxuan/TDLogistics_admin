const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");

const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};
//tạo thêm 1 bảng otp_staff
const table = "otp";

const pool = mysql.createPool(dbOptions).promise();

const createOTP = async (phonenumber, otp) => {
    let expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);
    expires = moment(expires).format("YYYY-MM-DD HH:mm:ss");

    try {
        await dbUtils.insert(pool, table, ["phone_number", "otp", "expires"], [phonenumber ,otp, expires]);
    } catch (error) {
        console.error("Error: ", error);
        throw "Lỗi cơ sở dữ liệu. Vui lòng thử lại!";
    }
};

const verifyOTP = async (phone_number, otp) => {
    let currentTime = new Date();
    currentTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");

    const query = `SELECT * FROM ${table} WHERE phone_number = ? AND otp = ? AND expires > ? LIMIT 1`;

    try {
        const result = await pool.query(query, [phone_number, otp, currentTime]);
        
        const isValidOTP = Array.isArray(result[0]) && result[0].length > 0;
        return isValidOTP;
    } catch (error) {
        console.log("Error: ", error);
        throw "Lỗi cơ sở dữ liệu. Vui lòng thử lại!";
    }
}


module.exports = {
    createOTP,
    verifyOTP,
   
}