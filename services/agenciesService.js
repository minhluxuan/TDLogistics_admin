const Agencies = require("../database/Agencies");

const checkExistAgency = async (info) => {
    return await Agencies.checkExistAgency(info);
}

const checkPostalCode = async (province, district, postal_code) => {
    return await Agencies.checkPostalCode(province, district, postal_code);
}

const checkWardsOccupation = async (province, district, wards) => {
    return await Agencies.checkWardsOccupation(province, district, wards);
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

const generateAgencyID = async (type, level, postal_code) => {
    return await Agencies.generateAgencyID(type, level, postal_code);
}

const locateAgencyInArea = async (choice, province, district, wards, agency_id, postal_code) => {
    return await Agencies.locateAgencyInArea(choice, province, district, wards, agency_id, postal_code);
}

const getOneAgency = async (info) => {
    return await Agencies.getOneAgency(info);
}

const getAgencies = async (info, paginationConditions) => {
    return await Agencies.getManyAgencies(info, paginationConditions);
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
    checkWardsOccupation,
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