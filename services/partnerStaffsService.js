const PartnerStaffs = require("../database/PartnerStaffs");

const checkExistPartnerStaff = async (info) => {
    return await PartnerStaffs.checkExistPartnerStaff(info);
}

const createNewPartnerStaff = async (info, postal_code) => {
    return await PartnerStaffs.createNewPartnerStaff(info, postal_code);
}

const getOnePartnerStaff = async (info) => {
    return await PartnerStaffs.getOnePartnerStaff(info);
}

const getManyPartnerStaffs = async (info, paginationConditions) => {
  	return await PartnerStaffs.getManyPartnerStaffs(info, paginationConditions);
}

const updatePartnerStaff = async (info, conditions, postal_code) => {
  	return await PartnerStaffs.updatePartnerStaff (info, conditions, postal_code) ;
}

const deletePartnerStaff = async (info, postalCode) => {
  	return await PartnerStaffs.deletePartnerStaff(info, postalCode);
}

const updatePartnerPassword = async (info, conditions) => {
   return await PartnerStaffs.updatePartnerPassword(info, conditions);
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