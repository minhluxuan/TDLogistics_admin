const Authorization = require("../database/Authorization");

const getAuthorization = async (personnel_id) => {
    return await Authorization.getAuthorization(personnel_id);
}

const updateAuthorization = async (personnel_id, givenPermissions) => {
    return await Authorization.updateAuthorization(personnel_id, givenPermissions);
}

const deleteAuthorization = async (personnel_id, revokedPermissions) => {
    return await Authorization.deleteAuthorization(personnel_id, revokedPermissions);
}

module.exports = {
    getAuthorization,
    updateAuthorization,
    deleteAuthorization,
}