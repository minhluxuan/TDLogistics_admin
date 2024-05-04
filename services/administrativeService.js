const Administrative = require("../database/AdministrativeUnit");

const checkExistProvince = async (province) => {
    return await Administrative.checkExistProvince(province);
}

const getOneDistributionCenter = async (province) => {
    return await Administrative.getOneDistributionCenter(province);
}

const getUnits = async (level, province = null, district = null) => {
    return await Administrative.getUnits(level, province, district);
}

const getOneAdministrativeUnit = async (condition) => {
    return await Administrative.getOneAdministrativeUnit(condition);
}

const getAdministrativeUnit = async (condition) => {
    return await Administrative.getAdministrativeUnit(condition);
}

const updateOneAdministrativeUnit = async (condition, info) => {
    return await Administrative.updateOneAdministrativeUnit(condition, info);
}

module.exports = {
    getUnits,
    getOneDistributionCenter,
    checkExistProvince,
    getOneAdministrativeUnit,
    updateOneAdministrativeUnit,
    getAdministrativeUnit,
}