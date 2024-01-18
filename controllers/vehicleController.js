const vehicleService = require("../services/vehicleService");
const utils = require("../utils");
const controllerUtils = require("./utils");
const fs = require("fs");
const path = require("path");

vehicleValidation = new utils.VehicleValidation();

const checkExistVehicle = async (req, res) => {
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
