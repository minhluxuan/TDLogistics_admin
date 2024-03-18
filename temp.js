const mysql = require("mysql2");
// const moment = require("moment");
// const dbUtils = require("../lib/dbUtils");

const dbOptions = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "nhan.nguyen1606",
  database: "localtdlogistics",
};
//tạo thêm 1 bảng otp_staff
const table = "district";

const pool = mysql.createPool(dbOptions).promise();

const XLSX = require("xlsx");
const workbook = XLSX.readFile("C:/Users/Admin/OneDrive/Desktop/Book1.xlsx");
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
const provinces = "Tỉnh Hà Nam";

for (const val of data) {
  let postal = val.Postal.toString();

  if (postal.length === 4) {
    // Thêm số 0 vào đầu mã bưu điện
    postal = "0" + postal;
  }
  const setClause = `postal_code = '${postal}'`;

  // Xây dựng điều kiện WHERE trong truy vấn SQL
  const whereClause = `province = '${provinces}' AND  district = '${val.District}'`;

  // Xây dựng truy vấn SQL hoàn chỉnh
  const sqlQuery = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

  pool.query(sqlQuery);

  console.log(val);
}

//   const sqlQuery = `UPDATE district SET postal_code = '60800' WHERE province = 'Tỉnh Kon Tum' AND district = 'Huyện Ia H\'\' Drai'`;

// pool.query(sqlQuery);
// console.log(data);
