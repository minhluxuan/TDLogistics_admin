const Users = require("../database/Users");

const checkExistUser = async (phoneNumber) => {
    return await Users.checkExistUser(phoneNumber);
}

const createNewUser = async (newUser) => {
    return await Users.createNewUser(newUser);
}

const getOneUser = async (conditions) => {
    return await Users.getOneUser(conditions);
}

const updateUserInfo = async (info, conditions) => {
    return await Users.updateUserInfo(info, conditions);
}

const getNameUsingPhoneNummber = async (phone_number) => {
    return await Users.getNameUsingPhoneNummber(phone_number);
}


module.exports = {
    checkExistUser,
    createNewUser,
    getOneUser,
    updateUserInfo,
    getNameUsingPhoneNummber
}
