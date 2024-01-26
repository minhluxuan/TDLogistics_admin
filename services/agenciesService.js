const Agencies = require("../database/Agencies");

const checkExistAgency = async (fields, values) => {
    return await Agencies.checkExistAgency(fields, values);
}

const createTableForAgency = async (postal_code) => {
    return await Agencies.createTableForAgency(postal_code);
}

const dropTableForAgency = async (postal_code) => {
    return await Agencies.dropTableForAgency(postal_code);
}

const generateAgencyID = async (level, province, district) => {
    return await Agencies.generateAgencyID(level, province, district);
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

const updateAgency = async (fields, values, conditionFields, conditionValues) => {
    return await Agencies.updateAgency(fields, values, conditionFields, conditionValues);
}

const deleteAgency = async (fields, values) => {
    return await Agencies.deleteAgency(fields, values);
}

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
    return await Agencies.updatePassword(fields, values, conditionFields, conditionValues);
}

const createNewAgency = async (fields, values) => {
    return await Agencies.createNewAgency(fields, values);
}

module.exports = {
    createTableForAgency,
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