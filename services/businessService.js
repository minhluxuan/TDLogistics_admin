const Business = require("../database/Business");

const checkExistBusinessUnion = async (conditions) => {
    return await Business.checkExistBusinessUnion(conditions);
}

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

const getManyBusinessUsers = async (conditions, paginationConditions) => {
  	return await Business.getManyBussinessUsers(conditions, paginationConditions);
}

const getOneRepresentor = async (conditions) => {
    return await Business.getOneRepresentor(conditions);
}

const getManyRepresentors = async (conditions) => {
    return await Business.getManyRepresentors(conditions);
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

const updatePassword = async (info, condition) => {
    return await Business.updatePassword(info, condition);
}

module.exports = {
    checkExistBusinessUnion,
    checkExistBusiness,
    checkExistBusinessRepresentor,
    createNewBusinessUser,
    createNewRepresentor,
    getOneBusinessUser,
    getManyBusinessUsers,
    getOneRepresentor,
    getManyRepresentors,
    updateBusinessUser,
    updateBusinessRepresentor,
    deleteBusinessUser,
    updatePassword,
}