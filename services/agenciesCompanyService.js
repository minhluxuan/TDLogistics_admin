const AgenciesCompany = require("../database/AgenciesCompany");

const createNewAgencyCompany = async (info) => {
  return await AgenciesCompany.createNewAgencyCompany(info);
};

const updateAgencyCompany = async (info, conditions) => {
  return await AgenciesCompany.updateAgencyCompany(info, conditions);
};

const getOneAgencyCompany = async (info) => {
  return await AgenciesCompany.getOneAgencyCompany(info);
};

const deleteAgencyCompany = async (info) => {
  return await AgenciesCompany.deleteAgencyCompany(info);
}

const checkExistAgencyCompany = async (info) => {
  return await AgenciesCompany.checkExistAgencyCompany(info);
};

module.exports = {
    createNewAgencyCompany,
    updateAgencyCompany,
    getOneAgencyCompany,
    deleteAgencyCompany,
    checkExistAgencyCompany,
}