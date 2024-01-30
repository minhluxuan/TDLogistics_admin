const Staffs = require("../database/Staffs");

const checkExistStaff = async (info) => {
    return await Staffs.checkExistStaff(info);
}

const createNewStaff = async (info, postal_code) => {
    return await Staffs.createNewStaff(info, postal_code);
}

const getOneStaff = async (fields, values) => {
    return await Staffs.getOneStaff(fields, values);
}

const getManyStaffs = async () => {
  	return await Staffs.getManyStaffs();
}

const updateStaff = async (fields, values, conditionFields, conditionValues) => {
  	return await Staffs.updateStaff (fields, values, conditionFields, conditionValues) ;
}

const deleteStaff = async (info) => {
  	return await Staffs.deleteStaff(info);
}

const createAccount = async(cccd ,account, password)=>{
    await Staffs.createAccount(cccd ,account, password);
}

const updatePassword = async (fields, values, conditionFields, conditionValues) => {
   return await Staffs.updatePassword(fields, values, conditionFields, conditionValues);
}

module.exports = {
    checkExistStaff,
    createNewStaff,
    getOneStaff,
    getManyStaffs,
    updateStaff,
    deleteStaff,
    updatePassword,
}