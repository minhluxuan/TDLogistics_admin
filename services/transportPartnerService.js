const Partner = require("../database/TransportPartner");

const checkExistPartner = async (info) => {
    return await Partner.checkExistPartner(info);
};

const createNewPartner = async (info, staff_id) => {
    await Partner.createNewPartner(info, staff_id);
};

const getOnePartner = async (info) => {
    return await Partner.getOnePartner(info);
};

const getManyPartners = async (info) => {
    return await Partner.getManyPartners(info);
};

const updatePartner = async (info, conditions) => {
    return await Partner.updatePartner(info, conditions);
};

const deletePartner = async (info) => {
    return await Partner.deletePartner(info);
};

module.exports = {
    checkExistPartner,
    createNewPartner,
    getOnePartner,
    getManyPartners,
    updatePartner,
    deletePartner,
};
