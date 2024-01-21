const { retryOptions } = require("@google/maps/lib/internal/convert");
const Vehicle = require("../database/Vehicles");

const checkExistVehicle = async (fields, values) => {
    try {
        const result = await Vehicle.checkExistVehicle(fields, values);
        return result;
    } catch (error) {
        console.error("Error in checkExistVehicle: ", error);
        throw error;
    }
};

const createNewVehicle = async (fields, values) => {
    try {
        const result = await Vehicle.createNewVehicle(fields, values);
        return result;
    } catch (error) {
        console.error("Error in createNewVehicle: ", error);
        throw error;
    }
};
const getVehicle = async (fields, values) => {
    try {
        const result = await Vehicle.getVehicle(fields, values);
        return result;
    } catch (error) {
        console.error("Error in getVehicleService: ", error);
        throw error;
    }
};

const getVehicleOrderID = async (vehicle_id) => {
    try {
        const result = await Vehicle.getVehicleOrderID(vehicle_id);
        return result;
    } catch (error) {
        console.error("Error in getVehicleOrderIDService: ", error);
        throw error;
    }
};
const updateVehicle = async (fields, values, conditionFields, conditionValues) => {
    try {
        if (!Array.isArray(fields) || !Array.isArray(values)) {
            throw new Error("Fields and values must be arrays");
        }

        const orderIdIndex = fields.indexOf("order_id");
        const vehicle_id = fields.indexOf("vehicle_id");
        if (orderIdIndex !== -1) {
            const orderIds = values[orderIdIndex];
            await Vehicle.handleOrderIds(orderIds, conditionFields, conditionValues);
            fields.splice(orderIdIndex, 1);
            values.splice(orderIdIndex, 1);
        }
        return await Vehicle.updateVehicle(fields, values, conditionFields, conditionValues);
    } catch (error) {
        console.error("Error in updateVehicle: ", error);
        throw error;
    }
};

const deleteVehicle = async (fields, values) => {
    try {
        return await Vehicle.deleteVehicle(fields, values);
    } catch (error) {
        console.error("Error in deleteVehicle: ", error);
        throw error;
    }
};

module.exports = { checkExistVehicle, createNewVehicle, updateVehicle, deleteVehicle, getVehicle, getVehicleOrderID };

// checkExistVehicle(["id"], [1]).then((result) => {
//     console.log(result);
// });

// getVehicle(["id"], [1]).then((res) => {
//     console.log(res);
// });

// deleteVehicle(["vehicle_id"], ["60B-C2-67890"]);
// updateVehicle(
//     ["max_load", "order_id"],
//     [900, { replace: { ABC11: "ABC22", ASE: "CNST" } }],
//     ["vehicle_id"],
//     ["50A-B1-12345"]
// ).then((res) => {
//     console.log(res);
// });
// updateVehicle(["max_load", "order_id"], [900, { append: ["ABCDE", "EFGH"] }], ["transport_partner_id"], ["ABC11"]).then(
//     (res) => {
//         console.log(res);
//     }
// );
