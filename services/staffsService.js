const Staffs = require("../database/Staffs");

const checkExistStaff = async (fields, values) => {
    return Staffs.checkExistStaff(fields, values);
}

const createNewStaff = async (fields, values) => {
    await Staffs.createNewStaff(fields, values);
}

const getOneStaff = async (fields, values) => {
    return await Staffs.getOneStaff(fields, values);
}

const getManyStaffs = async () => {
  	return await Staffs.getManyStaffs() ;
}

const updateStaff = async (fields, values, conditionFields, conditionValues) => {
  	return await Staffs.updateStaff (fields, values, conditionFields, conditionValues) ;
}

const deleteStaff = async(fields, values) => {
  	return await Staffs.deleteStaff(fields, values);
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