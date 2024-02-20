const Users = require("../database/Users");

const checkExistUser = async (phoneNumber) => {
    return await Users.checkExistUser(phoneNumber);
}

const createNewUser = async (newUser) => {
    return await Users.createNewUser(newUser);
}

const getOneUser = async (conditions) => {
    return Users.getOneUser(conditions);
}

const updateUserInfo = async (info, conditions) => {
    return await Users.updateUserInfo(info, conditions);
}


module.exports = {
    checkExistUser,
    createNewUser,
    getOneUser,
    updateUserInfo,
}
