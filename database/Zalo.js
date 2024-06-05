const mysql = require("mysql2");

const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};


const pool = mysql.createPool(dbOptions).promise();

const updateKey = async (accessToken, refreshToken) => {
	try {
		const query = `UPDATE zalo SET access_token = ?, refresh_token = ?`;
		await pool.query(query, [accessToken, refreshToken]);
	}
	catch (err) {
		throw new Error (`Error message: ${err.message}`);
	}

}

const instertKey = async (accessToken, refreshToken) => {
	const query = `INSERT INTO zalo (access_token, refresh_token) VALUES (?, ?)`;
	await pool.query(query, [accessToken, refreshToken]);
}


const gettingKey = async () => {
	try
	{
		const query = `SELECT * FROM zalo `;
		const result = await pool.query(query);
		return result[0][0];
	}
	catch (err)
	{
		throw new Error (`Error message: ${err.message}`);
	}

}

module.exports = {
  gettingKey,
  updateKey,
  
}
