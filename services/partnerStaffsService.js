const PartnerStaffs = require("../database/PartnerStaffs");

const checkExistPartnerStaff = async (conditions) => {
    return PartnerStaffs.checkExistPartnerStaff(conditions);
}

const createNewPartnerStaff = async (info) => {
    return await PartnerStaffs.createNewPartnerStaff(info);
}

const getOnePartnerStaff = async (fields, values) => {
    return await PartnerStaffs.getOnePartnerStaff(fields, values);
}

const getManyPartnerStaffs = async () => {
  	return await PartnerStaffs.getManyPartnerStaffs() ;
}

const updatePartnerStaff = async (info) => {
  	return await PartnerStaffs.updatePartnerStaff(info) ;
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