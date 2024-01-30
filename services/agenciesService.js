const Agencies = require("../database/Agencies");

const checkExistAgency = async (fields, values) => {
    return await Agencies.checkExistAgency(fields, values);
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

const locateAgencyInArea = async (choice, agency_id) => {
    return await Agencies.locateAgencyInArea(choice, agency_id);
}

const getOneAgency = async (fields, values) => {
    return await Agencies.getOneAgency(fields, values);
}

const getManyAgencies = async (fields, values) => {
    return await Agencies.getManyAgencies(fields, values);
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
    getManyAgencies,
    updateAgency,
    updatePassword,
    deleteAgency,
    createNewAgency,
};