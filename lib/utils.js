const bcrypt = require("bcrypt");

const hash = (password) => {
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALTROUNDS));
    const hashPassword = bcrypt.hashSync(password, salt);
    return hashPassword;
}

const getAddressFromComponent = (province, district, ward, detail) => {
    const address = detail + ", " + ward + ", " + district + ", " + province;
    return address;
}

const getPostalCodeFromAgencyID = (agency_id) => {
    const agencyComponent = agency_id.split('_');
    return agencyComponent[1];
}

module.exports = {
    hash,
    getAddressFromComponent,
    getPostalCodeFromAgencyID,
}