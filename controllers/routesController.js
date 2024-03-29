const routesService = require("../services/routesService");
const validation = require("../lib/validation");
const administrativeService = require("../services/administrativeService");
const vehicleService = require("../services/vehicleService");
const { checkExistRoute } = require("../database/Routes");

const routeValidation = new validation.RouteValidation();

const createNewRoute = async (req, res) => {
    try {
        const { error } = routeValidation.validateCreatingNewRoute(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (!(await administrativeService.checkExistProvince(req.body.source))) {
            return res.status(404).json({
                error: true,
                message: `Điểm xuất phát: ${req.body.source} không tồn tại.`,
            });
        }

        if (!(await administrativeService.checkExistProvince(req.body.destination))) {
            return res.status(404).json({
                error: true,
                message: `Điểm đến: ${req.body.source} không tồn tại.`,
            });
        }

        if (!(await vehicleService.checkExistVehicle({ vehicle_id: req.body.vehicle_id }))) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã hiệu ${req.body.vehicle_id} không tồn tại.`,
            });
        }

        if (await routesService.checkExistRoute(req.body)) {
            return res.status(409).json({
                error: true,
                message: `Tuyến đường ${req.body.source} - ${req.body.destination} khởi hành lúc ${req.body.departure_time} của phương tiện có mã ${req.body.vehicle_id} đã tồn tại.`,
            });
        }

        const resultCreatingNewRoute = routesService.createNewRoute(req.body);
        if (!resultCreatingNewRoute || resultCreatingNewRoute.affectedRows === 0) {
            return res.status(409).json({
                error: true,
                message: `Tạo tuyến đường ${req.body.source} - ${req.body.destination} với thời gian khởi hành ${req.body.departure_time} thất bại.`,
            });
        }

        return res.status(201).json({
            error: false,
            message: `Tạo tuyến đường ${req.body.source} - ${req.body.destination} với thời gian khởi hành ${req.body.departure_time} thành công.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const getRoutes = async (req, res) => {
    try {
        const { error } = routeValidation.validateGettingRoute(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultGettingRoutes = await routesService.getRoutes(req.body);
        return res.status(200).json({
            error: false,
            data: resultGettingRoutes,
            message: `Lấy tuyến đường thành công.`,
        });   
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const updateRoute = async (req, res) => {
    try {
        if (req.query.id) {
            try {
                req.query.id = parseInt(req.query.id);
            } catch (error) {
                return res.status(400).json({
                    error: true,
                    message: "id không hợp lệ.",
                });
            }
        }
        else {
            return res.status(400).json({
                error: true,
                message: "Trường id không được để trống.",
            });
        }

        const { error: error1 } = routeValidation.validateRouteId(req.query);
        if (error1) {
            return res.status(400).json({
                error: true,
                message: error1.message,
            });
        }

        const { error: error2 } = routeValidation.validateUpdatingRoute(req.body);
        if (error2) {
            return res.status(400).json({
                error: true,
                message: error2.message,
            });
        }

        if (req.body.vehicle_id && !(await vehicleService.checkExistVehicle(req.query))) {
            return res.status(404).json({
                error: true,
                message: `Phương tiện có mã ${req.query.vehicle_id} không tồn tại.`,
            });
        }

        const resultGettingOneRoute = await routesService.getOneRoute(req.query);
        if (!resultGettingOneRoute || resultGettingOneRoute.length === 0) {
            return res.status(404).json({
                error: true,
                message: `Tuyến đường có id = ${req.query.id} không tồn tại.`,
            });
        }
        
        const tempUpdatedInfo = resultGettingOneRoute[0];
        for (const prop in req.body) {
            tempUpdatedInfo[prop] = req.body[prop];
        }

        if (await checkExistRoute(tempUpdatedInfo)) {
            return res.status(409).json({
                error: true,
                message: `Tuyến đường ${tempUpdatedInfo.source} - ${tempUpdatedInfo.destination} khởi hành lúc ${tempUpdatedInfo.departure_time} của phương tiện có mã ${tempUpdatedInfo.vehicle_id} đã tồn tại.`,
            });
        }

        const resultUpdatingRoute = await routesService.updateRoute(req.body, req.query);
        if (!resultUpdatingRoute || resultUpdatingRoute.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Tuyến đường có id = ${req.query.id} không tồn tại.`,
            });
        }

        return res.status(201).json({
            error: false,
            message: `Cập nhật tuyến đường có id = ${req.query.id} thành công.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const deleteRoute = async (req, res) => {
    try {
        if (req.query.id) {
            try {
                req.query.id = parseInt(req.query.id);
            } catch (error) {
                return res.status(400).json({
                    error: true,
                    message: "id không hợp lệ.",
                });
            }
        }
        else {
            return res.status(400).json({
                error: true,
                message: "Trường id không được để trống.",
            });
        }

        const { error } = routeValidation.validateRouteId(req.query);
        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const resultDeletingRoute = await routesService.deleteRoute(req.query);
        if (!resultDeletingRoute || resultDeletingRoute.affectedRows === 0) {
            return res.status(404).json({
                error: true,
                message: `Tuyến đường có id = ${req.query.id} không tồn tại.`,
            });
        }

        return res.status(200).json({
            error: false,
            message: `Xoá tuyến đường có id = ${req.query.id} thành công.`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

module.exports = {
    createNewRoute,
    getRoutes,
    updateRoute,
    deleteRoute,
}