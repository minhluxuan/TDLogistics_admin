const Administrative = require("../database/AdministrativeUnit");

const getUnits = async (level, province = null, district = null) => {
    return await Administrative.getUnits(level, province, district);
}

module.exports = {
    getUnits
}