const PartnerStaffs = require("../database/PartnerStaffs");

const checkExistPartnerStaff = async (fields, values) => {
    return PartnerStaffs.checkExistPartnerStaff(fields, values);
}

const createNewPartnerStaff = async (fields, values) => {
    await PartnerStaffs.createNewPartnerStaff(fields, values);
}

const getOnePartnerStaff = async (fields, values) => {
    return await PartnerStaffs.getOnePartnerStaff(fields, values);
}

const getManyPartnerStaffs = async () => {
  	return await PartnerStaffs.getManyPartnerStaffs() ;
}

const updatePartnerStaff = async (fields, values, conditionFields, conditionValues) => {
  	return await PartnerStaffs.updatePartnerStaff(fields, values, conditionFields, conditionValues) ;
}

const deletePartnerStaff = async(fields, values) => {
  	return await PartnerStaffs.deletePartnerStaff(fields, values);
}


const updatePartnerPassword = async (fields, values, conditionFields, conditionValues) => {
   return await PartnerStaffs.updatePartnerStaff(fields, values, conditionFields, conditionValues);
}

module.exports = {
    checkExistPartnerStaff,
    createNewPartnerStaff,
    getOnePartnerStaff,
    getManyPartnerStaffs,
    updatePartnerStaff,
    deletePartnerStaff,
    updatePartnerPassword,
}