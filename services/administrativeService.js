const Administrative = require("../database/AdministrativeUnit");

const checkExistProvince = async (province) => {
    return await Administrative.checkExistProvince(province);
}

const getUnits = async (level, province = null, district = null) => {
    return await Administrative.getUnits(level, province, district);
}

module.exports = {
    getUnits,
    checkExistProvince,
}