const Agencies = require("../database/Agencies");

const checkExistAgency = async (info) => {
    return await Agencies.checkExistAgency(info);
}

const checkPostalCode = async (level, province, district, postal_code) => {
    return await Agencies.checkPostalCode(level, province, district, postal_code);
}

const createNewAgency = async (info) => {
    return await Agencies.createNewAgency(info);
}

const createTablesForAgency = async (postal_code) => {
    return await Agencies.createTablesForAgency(postal_code);
}

const dropTableForAgency = async (postal_code) => {
    return await Agencies.dropTableForAgency(postal_code);
}

const generateAgencyID = async (prefix, level, postal_code) => {
    return await Agencies.generateAgencyID(prefix, level, postal_code);
}

const locateAgencyInArea = async (choice, first2CharPostalCode, agency_id) => {
    return await Agencies.locateAgencyInArea(choice, first2CharPostalCode, agency_id);
}

const getOneAgency = async (fields, values) => {
    return await Agencies.getOneAgency(fields, values);
}

const getAgencies = async (info) => {
    return await Agencies.getManyAgencies(info);
}

const updateAgency = async (info, conditions) => {
    return await Agencies.updateAgency(info, conditions);
}

const deleteAgency = async (info) => {
    return await Agencies.deleteAgency(info);
}

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
    return await Agencies.updatePassword(fields, values, conditionFields, conditionValues);
}

module.exports = {
    checkPostalCode,
    createTablesForAgency,
    dropTableForAgency,
    generateAgencyID,
    locateAgencyInArea,
    checkExistAgency,
    getOneAgency,
    getAgencies,
    updateAgency,
    updatePassword,
    deleteAgency,
    createNewAgency,
};