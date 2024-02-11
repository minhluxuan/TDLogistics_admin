const Staffs = require("../database/Staffs");

const checkExistStaff = async (info) => {
    return await Staffs.checkExistStaff(info);
}

const checkExistStaffIntersect = async (info) => {
    return await Staffs.checkExistStaffIntersect(info);
}

const createNewStaff = async (info, postal_code) => {
    return await Staffs.createNewStaff(info, postal_code);
}

const getOneStaff = async (info) => {
    return await Staffs.getOneStaff(info);
}

const getManyStaffs = async (info) => {
  	return await Staffs.getManyStaffs(info);
}

const updateStaff = async (info, conditions, postal_code) => {
  	return await Staffs.updateStaff (info, conditions, postal_code) ;
}

const deleteStaff = async (info, postalCode) => {
  	return await Staffs.deleteStaff(info, postalCode);
}

const createAccount = async(cccd ,account, password)=>{
    await Staffs.createAccount(cccd ,account, password);
}

const updatePassword = async (info, conditions) => {
   return await Staffs.updatePassword(info, conditions);
}

module.exports = {
    checkExistStaff,
    checkExistStaffIntersect,
    createNewStaff,
    getOneStaff,
    getManyStaffs,
    updateStaff,
    deleteStaff,
    updatePassword,
}