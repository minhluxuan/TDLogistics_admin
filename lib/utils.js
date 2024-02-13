const bcrypt = require("bcrypt");

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