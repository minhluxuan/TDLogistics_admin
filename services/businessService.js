const Business = require("../database/Business");

const checkExistBusiness = async (fields, values) => {

    return await Business.checkExistBusiness(fields, values);
}

const createNewBusinessUser = async (fields, values) => {
    await Business.createNewBusinessUser(fields, values);
}

const getOneBusinessUser = async (fields, values) => {
    return await Business.getOneBusinessUser(fields, values);
}

const getManyBusinessUsers = async (fields, values) => {
  	return await Business.getManyBussinessUsers(fields, values) ;
}

const updateBusinessUser = async (fields, values, conditionFields, conditionValues) => {
    return await Business.updateBusinessUser (fields, values, conditionFields, conditionValues) ;
}

const deleteBusinessUser = async(fields, values) => {
    return await Business.deleteBusinessUSer(fields, values);
}

module.exports = {
    checkExistBusiness,
    createNewBusinessUser,
    getOneBusinessUser,
    getManyBusinessUsers,
    updateBusinessUser,
    deleteBusinessUser
}