const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const moment = require("moment");
const dbUtils = require("../lib/dbUtils");

const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};
const pool = mysql.createPool(dbOptions).promise();


const hash = (password) => {
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
    const hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}

const getPostalCodeFromAgencyID = (agency_id) => {
    const agencyComponent = agency_id.split('_');
    return agencyComponent[1];
}

const shortenName = async (fullname) => {
    const words = fullname.split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase());
    return initials.join('');
}



module.exports = {
    hash,
    getPostalCodeFromAgencyID,
    shortenName,
}