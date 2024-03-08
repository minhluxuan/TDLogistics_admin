const Partner = require("../database/TransportPartner");

const checkExistPartner = async (info) => {
    return await Partner.checkExistPartner(info);
};

const createNewPartner = async (info) => {
    return await Partner.createNewPartner(info);
};

const getOnePartner = async (info) => {
    return await Partner.getOnePartner(info);
};

const getManyPartners = async (info, paginationConditions) => {
    return await Partner.getManyPartners(info, paginationConditions);
};

const updatePartner = async (info, conditions) => {
    return await Partner.updatePartner(info, conditions);
};

const deletePartner = async (condtions) => {
    return await Partner.deletePartner(condtions);
};

module.exports = {
    checkExistPartner,
    createNewPartner,
    getOnePartner,
    getManyPartners,
    updatePartner,
    deletePartner,
};
