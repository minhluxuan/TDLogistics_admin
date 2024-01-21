const vehicleService = require("../services/vehicleService");
const utils = require("../utils");
const controllerUtils = require("./utils");
const fs = require("fs");
const path = require("path");

const vehicleValidation = new controllerUtils.VehicleValidation();

const checkExistVehicle = async (req, res) => {
    //check here
    if (!req.isAuthenticated() || req.user.permission < 2) {
        return res.status(401).json({
            error: true,
            message: "You are not authorized to access this resource.",
        });
    }
    //end check
    const { error } = vehicleValidation.validateCheckingExistVehicle(req.query);

    if (error) {
        return res.status(400).json({
            error: true,
            message: "Invalid vehicle information.",
        });
    }

    try {
        const existed = await vehicleService.checkExistVehicle(Object.keys(req.query), Object.values(req.query));
        return res.status(200).json({
            error: false,
            existed: existed,
            message: existed ? "Vehicle already exists." : "Vehicle does not exist.",
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};
const createNewVehicle = async (req, res) => {
    //check here
    if (!req.isAuthenticated() || req.user.permission < 2) {
        return res.status(401).json({
            error: true,
            message: "You are not authorized to access this resource.",
        });
    }
    //end check

    try {
        const { error } = vehicleValidation.validateCreatingVehicle(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Invalid vehicle information.",
            });
        }
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        const result = await vehicleService.checkExistVehicle(keys, values);

        if (result) {
            return res.status(400).json({
                error: true,
                message: "Vehicle already exists.",
            });
        }

        const created = await vehicleService.createNewVehicle(keys, values);
        if (created) {
            return res.status(200).json({
                error: false,
                message: "Vehicle added successfully!",
            });
        } else {
            return res.status(200).json({
                error: false,
                message: "Can't create vehicle, try later",
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};
//GET
//api/v1/vehicle/search? staff_id=? vehicle_id=? type=? license=? busy=?
//GET everything except order_id

//api/v1/vehicle/search_order_ids? vehicle_id =
//UNION with the order table
const getVehicle = async (req, res) => {
    //check here
    if (!req.isAuthenticated() || req.user.permission < 2) {
        return res.status(401).json({
            error: true,
            message: "You are not authorized to access this resource.",
        });
    }
    //end check
    try {
        const fields = Object.keys(req.query);
        const values = Object.values(req.query);
        const result = await vehicleService.getVehicle(fields, values);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in getVehicleController: ", error);
        return res.status(500).json({ error: true, message: error.message });
    }
};

const getVehicleOrderID = async (req, res) => {
    //check here
    if (!req.isAuthenticated() || req.user.permission < 2) {
        return res.status(401).json({
            error: true,
            message: "You are not authorized to access this resource.",
        });
    }
    //end check
    try {
        const vehicle_id = req.query.vehicle_id;
        if (!vehicle_id) {
            return res.status(400).json({ error: true, message: "vehicle_id is required" });
        }
        const result = await vehicleService.getVehicleOrderID(vehicle_id);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in getVehicleOrderIDController: ", error);
        return res.status(500).json({ error: true, message: error.message });
    }
};

const updateVehicle = async (req, res) => {
    //check here
    if (!req.isAuthenticated() || req.user.permission < 2) {
        return res.status(401).json({
            error: true,
            message: "You are not authorized to access this resource.",
        });
    }
    //end check

    try {
        // Validate the request body here
        const { err1 } = vehicleValidation.validateUpdatingVehicle(req.body);
        if (err1) {
            return res.status(400).json({
                error: true,
                message: "Invalid vehicle information.",
            });
        }
        const { err2 } = vehicleValidation.validateUpdatingVehicle(req.query.vehicle_id);
        if (err2) {
            return res.status(400).json({
                error: true,
                message: "Invalid vehicle IDs",
            });
        }
        // Update the vehicle
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        // api/v1/vehicle/update? vehicle_id = abc
        // if there are a need for multiple update, change in the array
        //currently allowed for vehicle_id only
        await vehicleService.updateVehicle(keys, values, ["vehicle_id"], [req.query.vehicle_id]);

        return res.status(200).json({
            error: false,
            message: "Vehicle updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

const deleteVehicle = async (req, res) => {
    //check here
    if (!req.isAuthenticated() || req.user.permission < 2) {
        return res.status(401).json({
            error: true,
            message: "You are not authorized to access this resource.",
        });
    }
    //end check

    const { err } = vehicleValidation.validateDeletingVehicle(req.query.vehicle_id);
    if (err) {
        return res.status(400).json({
            error: true,
            message: "Invalid vehicle IDs",
        });
    }
    try {
        // api/v1/vehicle/delete? vehicle_id=?
        //currently allowed for vehicle_id only
        await vehicleService.deleteVehicle(["vehicle_id"], [req.query.vehicle_id]);
        return res.status(200).json({
            error: false,
            message: "Vehicle deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};
module.exports = { checkExistVehicle, createNewVehicle, getVehicle, getVehicleOrderID, updateVehicle, deleteVehicle };
