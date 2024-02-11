const Business = require("../database/Business");

const checkExistBusiness = async (conditions) => {
    return await Business.checkExistBusiness(conditions);
}

const checkExistBusinessRepresentor = async (conditions) => {
    return await Business.checkExistBusinessRepresentor(conditions);
}

const createNewBusinessUser = async (info) => {
    return await Business.createNewBusinessUser(info);
}

const createNewRepresentor = async (info) => {
    return await Business.createNewRepresentor(info);
}

const getOneBusinessUser = async (conditions) => {
    return await Business.getOneBusinessUser(conditions);
}

const getManyBusinessUsers = async (conditions) => {
  	return await Business.getManyBussinessUsers(conditions);
}

const getRepresentor = async (conditions) => {
    return await Business.getRepresentor(conditions);
}

const updateBusinessUser = async (info, conditions) => {
    return await Business.updateBusinessUser(info, conditions) ;
}

const updateBusinessRepresentor = async (info, conditions) => {
    return await Business.updateBusinessRepresentor(info, conditions);
}

const deleteBusinessUser = async(info) => {
    return await Business.deleteBusinessUSer(info);
}

module.exports = {
    checkExistBusiness,
    checkExistBusinessRepresentor,
    createNewBusinessUser,
    createNewRepresentor,
    getOneBusinessUser,
    getManyBusinessUsers,
    getRepresentor,
    updateBusinessUser,
    updateBusinessRepresentor,
    deleteBusinessUser
}