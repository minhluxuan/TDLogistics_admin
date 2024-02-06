const Authorization = require("../database/Authorization");

const getPermissionByRole = async (role) => {
    return await Authorization.getPermissionByRole(role);
}

const grantPermissions = async (staffId, privileges, postalCode) => {
    return await Authorization.grantPermissions(staffId, privileges, postalCode);
}

const revokePermissions = async (staffId, privileges, postalCode) => {
    return await Authorization.revokePermissions(staffId, privileges, postalCode);
}

module.exports = {
    getPermissionByRole,
    grantPermissions,
    revokePermissions,
}