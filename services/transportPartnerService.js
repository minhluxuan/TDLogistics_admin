const Partner = require("../database/TransportPartner");

const checkExistPartner = async (fields, values) => {
    return await Partner.checkExistPartner(fields, values);
};

const createNewPartner = async (fields, values, personnel_id) => {
    await Partner.createNewPartner(fields, values, personnel_id);
};

const getOnePartner = async (fields, values) => {
    return await Partner.getOnePartner(fields, values);
};

const getManyPartners = async (fields, values) => {
    return await Partner.getManyPartners(fields, values);
};

const updatePartner = async (fields, values, conditionFields, conditionValues) => {
    return await Partner.updatePartner(fields, values, conditionFields, conditionValues);
};

const deletePartner = async (fields, values) => {
    return await Partner.deletePartner(fields, values);
};

module.exports = {
    checkExistPartner,
    createNewPartner,
    getOnePartner,
    getManyPartners,
    updatePartner,
    deletePartner,
};
