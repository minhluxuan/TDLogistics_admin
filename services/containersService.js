const Container = require("../database/Containers");

const createContainer = async (shipment_id, container_id) => {
    return await Container.createContainer(shipment_id, container_id);
}

const updateInContainer = async(shipment_id, container_id) => {
    return await Container.updateInContainer(shipment_id, container_id);
}


const updateOutContainer = async(shipment_id, container_id) => {
    return await Container.updateOutContainer(shipment_id, container_id);
}

const getContainer = async (container_id) => {
    return await Container.getContainer(container_id);
}


module.exports = {
    createContainer,
    updateInContainer,
    updateOutContainer,
    getContainer,
};