const vehicleService = require("../services/vehicleService");
const utils = require("../utils");
const controllerUtils = require("./utils");
const fs = require("fs");
const path = require("path");

const vehicleValidation = new controllerUtils.VehicleValidation();

const checkExistVehicle = async (req, res) => {
    //check here
    // if (!req.isAuthenticated() || req.user.permission < 2) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "You are not authorized to access this resource.",
    //     });
    // }
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
    // if (!req.isAuthenticated() || req.user.permission < 2) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "You are not authorized to access this resource.",
    //     });
    // }
    //end check

    try {
        const { error } = vehicleValidation.validateCreatingVehicle(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: "Invalid vehicle information.",
            });
        }

        const result = await vehicleService.checkExistVehicle(["vehicle_id"], [req.body.vehicle_id]);

        if (result) {
            return res.status(400).json({
                error: true,
                message: "Vehicle already exists.",
            });
        }

        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        created = await vehicleService.createNewVehicle(keys, values);
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

const updateVehicle = async (req, res) => {
    //check here
    // if (!req.isAuthenticated() || req.user.permission < 2) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "You are not authorized to access this resource.",
    //     });
    // }
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
    // if (!req.isAuthenticated() || req.user.permission < 2) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "You are not authorized to access this resource.",
    //     });
    // }
    //end check

    const { err } = vehicleValidation.validateDeletingVehicle(req.query.vehicle_id);
    if (err) {
        return res.status(400).json({
            error: true,
            message: "Invalid vehicle IDs",
        });
    }
    try {
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
module.exports = { checkExistVehicle, createNewVehicle, updateVehicle, deleteVehicle };
