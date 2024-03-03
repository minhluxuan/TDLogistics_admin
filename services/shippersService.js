const Shippers = require("../database/Shippers");

const assignNewTasks = async (order_ids, staff_id, postal_code) => {
    return await Shippers.assignNewTasks(order_ids, staff_id, postal_code);
}

module.exports = {
    assignNewTasks,
}