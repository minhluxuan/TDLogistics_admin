const Routes = require("../database/Routes");

const checkExistRoute = async (condition) => {
    return await Routes.checkExistRoute(condition);
}

const createNewRoute = async (info) => {
    return await Routes.createNewRoute(info);
}

const getOneRoute = async (condition) => {
    return await Routes.getOneRoute(condition);
}

const getRoutes = async (conditions) => {
    return await Routes.getRoutes(conditions);
}

const updateRoute = async (info, condition) => {
    return await Routes.updateRoute(info, condition)
}

const deleteRoute = async (condition) => {
    return await Routes.deleteRoute(condition);
}

module.exports = {
    checkExistRoute,
    createNewRoute,
    getOneRoute,
    getRoutes,
    updateRoute,
    deleteRoute,
}