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

        keys.push("shipment_id");
        values.push(shipmentId);
        keys.push("route");
        values.push(req.body.route);

        if ("transport_partner_id" in req.body) {
            const data = await shipmentService.getDataForShipmentCode(req.body.staff_id, req.body.transport_partner_id);
            const partnerName = await utils.getNameLetter(data.partnerName);
            const VehicleID = data.VehicleID;
            const shipmentCode = "TD" + "-" + partnerName + "-" + createTime.getFullYear().toString() + createTime.getMonth().toString() + createTime.getDay().toString() + "-" + req.body.route + "-" + VehicleID;
            keys.push("shipment_code");
            values.push(shipmentCode);
            keys.push("transport_partner_id");
            values.push(req.body.transport_partner_id);
            keys.push("staff_id");
            values.push(req.body.staff_id);
            keys.push("vehicle_code");
            values.push(VehicleID);
        } else {
            const data = await shipmentService.getDataForShipmentCode(req.body.staff_id);
            const shipperName = await utils.getNameLetter(data.fullname);
            const VehicleID = data.VehicleID ;
            const shipmentCode = "TD" + "-" + shipperName + "-" + createTime.getFullYear().toString() + createTime.getMonth().toString() + createTime.getDay().toString() + "-" + req.body.route + "-" + VehicleID;

            keys.push("shipment_code");
            values.push(shipmentCode);
            keys.push("staff_id");
            values.push(req.body.staff_id);
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

module.exports = {
    createNewShipment,
};