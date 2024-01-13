const moment = require("moment");
const shipmentService = require("../services/shipmentService");
const utils = require("./utils");
const servicesUtils = require("../services/utils");



const createNewShipment = async (req, res) => {
    // if(!req.isAuthenticated() || req.user.permisson < 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }

    try {
        const shipmentRequestValidation = new utils.ShipmentValidation(req.body);
        const { error } = shipmentRequestValidation.validateCreatingShipment();

        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const keys = new Array();
        const values = new Array();

        const createTime = new Date();
        const formattedCreateTime = moment(createTime).format("YYYY-MM-DD HH:mm:ss");

        const shipmentId = "TD" + createTime.getFullYear().toString() + createTime.getMonth().toString() + createTime.getDay().toString() + createTime.getHours().toString() + createTime.getMinutes().toString() + createTime.getSeconds().toString() + createTime.getMilliseconds().toString();

        //get address throught coordinate
        const map = new servicesUtils.Map();

        const source = {
            lat: req.body.lat_source,
            long: req.body.long_source,
        };

        const destination = {
            lat: req.body.lat_destination,
            long: req.body.long_destination,
        };

        const addressSource = await map.convertCoordinateToAddress(source);
        const addressDestination = await map.convertCoordinateToAddress(destination);

        keys.push("shipment_id");
        values.push(shipmentId);

        keys.push("address_source");
        values.push(addressSource);

        keys.push("address_destination");
        values.push(addressDestination);

        if ("transport_partner_id" in req.body) {
            const data = await shipmentService.getDataForShipmentCode(req.body.staff_id, req.body.transport_partner_id);
            const partnerName = await utils.shortenName(data.partnerName);
            const VehicleID = data.VehicleID;
            const shipmentCode = "TD" + "-" + partnerName + "-" + createTime.getFullYear().toString() + createTime.getMonth().toString() + createTime.getDay().toString() + "-" + req.body.route + "-" + VehicleID;
            
            if ("route" in req.body) {
                delete req.body.route;
            }

            for (const key in req.body) {
                keys.push(key);
                values.push(req.body[key]);
            }
            
            keys.push("shipment_code");
            values.push(shipmentCode);

            keys.push("vehicle_code");
            values.push(VehicleID);

        } else {
            const data = await shipmentService.getDataForShipmentCode(req.body.staff_id);
            const shipperName = await utils.shortenName(data.fullname);
            const VehicleID = data.VehicleID ;
            const shipmentCode = "TD" + "-" + shipperName + "-" + createTime.getFullYear().toString() + createTime.getMonth().toString() + createTime.getDay().toString() + "-" + req.body.route + "-" + VehicleID;

            if ("route" in req.body) {
                delete req.body.route;
            }

            for(const key in req.body) {
                keys.push(key);
                values.push(req.body[key]);
            }

            keys.push("shipment_code");
            values.push(shipmentCode);
        
            keys.push("vehicle_code");
            values.push(VehicleID);      

        }

        const result = await shipmentService.createNewShipment(keys, values);
        return res.status(200).json({
            error: false,
            message: "Tạo lô hàng thành công!",
        });
        


    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }

}

const updateShipment = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission < 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }

    try {

        const shipmentRequestValidation = new utils.ShipmentValidation(req.body);
        const { error } = shipmentRequestValidation.validateUpdatingShipment();

        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const fields = "mass";
        const values = req.body.mass;

        const conditionFields = "shipment_id";
        const conditionValues = req.body.shipment_id;

        const result = await shipmentService.updateShipment(fields, values, conditionFields, conditionValues);
        return res.status(200).json({
            error: false,
            message: "Cập nhật lô hàng thành công!",
        });

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }

}

const getShipment = async (req, res) => {
    // if (!req.isAuthenticated() || req.user.permission < 3) {
    //     return res.status(401).json({
    //         error: true,
    //         message: "Bạn không được phép truy cập tài nguyên này.",
    //     });
    // }
    
    try {

        const shipmentRequestValidation = new utils.ShipmentValidation(req.body);
        const { error } = shipmentRequestValidation.validateFindingShipment();
        
        if(error) {
            return res.status(400).json({
                error: true,
                message: "Thông tin không hợp lệ!",
            });
        }

        const fields = "parent";
        const values = req.body.shipment_id;
        const result = await shipmentService.getShipment(fields, values);
        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy thông tin lô hàng thành công!",
        })

    } catch(error) {
        return res.status(500).json({
            error: true,
            message: error,
        });
    }

}

module.exports = {
    createNewShipment,
    updateShipment,
    getShipment,
};