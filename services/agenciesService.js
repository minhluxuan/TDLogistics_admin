const Agencies = require("../database/Agencies");

const checkExistAgency = async (fields, values) => {
    return await Agencies.checkExistAgency(fields, values);
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
    checkExistAgency,
    getOneAgency,
    getManyAgencies,
    updateAgency,
    updatePassword,
    deleteAgency,
    createNewAgency,
};