const mysql = require("mysql2");
const moment = require("moment");
const SQLutils = require("../lib/dbUtils");
const libMap = require("../lib/map");
const dbOptions = {
    host: process.env.HOST,
    port: process.env.DBPOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};

const table = "orders";

const pool = mysql.createPool(dbOptions).promise();

const checkExistOrder = async (info, postal_code = null) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const ordersTable = postal_code ? postal_code + '_' + table : table;
    const result = await SQLutils.findOneIntersect(pool, ordersTable, fields, values);
    return result.length > 0;
};

const getOrdersOfAgency = async (postalCode, conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const result = await SQLutils.find(pool, postalCode + '_' + table, fields, values, true);

    for (const elm of result) {
        try {
            if (elm.journey) {
                elm.journey = JSON.parse(elm.journey);
            }   
        } catch (error) {
            // Nothing to do
        }
    }

    return result;
}

const getOneOrder = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    let query;
    if (!fields || !values || fields.length === 0 || values.length === 0) {
        query = `SELECT order_id, user_id, agency_id, service_type, name_sender, phone_number_sender, name_receiver, phone_number_receiver, mass, height, width, length, province_source, district_source, ward_source, detail_source, province_dest, district_dest, ward_dest, detail_dest, long_source, lat_source, long_destination, lat_destination, fee, journey, COD, shipper, status_code, miss, qrcode, paid, created_at, last_update FROM ${table} LIMIT 1`;
    }
    else {
        query = `SELECT order_id, user_id, agency_id, service_type, name_sender, phone_number_sender, name_receiver, phone_number_receiver, mass, height, width, length, province_source, district_source, ward_source, detail_source, province_dest, district_dest, ward_dest, detail_dest, long_source, lat_source, long_destination, lat_destination, fee, journey, COD, shipper, status_code, miss, qrcode, paid, created_at, last_update FROM ${table} WHERE ${fields.map(field => `${field} = ?`).join(" AND ")} LIMIT 1`;
    }

    const result = await pool.query(query, values);

    for (const elm of result[0]) {
        try {
            if (elm.journey) {
                elm.journey = JSON.parse(elm.journey);
            }   
        } catch (error) {
            // Nothing to do
        }
    }

    return result[0];
}

const getOrders = async (conditions, paginationConditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const limit = paginationConditions.rows || 0;
    const offset = paginationConditions.page ? paginationConditions.page * limit : 0;

        if (fields !== null && values !== null && fields.length > 0 && values.length > 0) {
            const whereClause =  fields.map(field => `${field} = ? `).join(' AND ');
            query = `SELECT order_id, user_id, agency_id, service_type, name_sender, phone_number_sender, name_receiver, phone_number_receiver, mass, height, width, length, province_source, district_source, ward_source, detail_source, province_dest, district_dest, ward_dest, detail_dest, long_source, lat_source, long_destination, lat_destination, fee, journey, COD, shipper, status_code, miss, qrcode, paid, created_at, last_update FROM ${table} WHERE ${whereClause} ORDER BY created_at DESC`;
    
            if (offset && typeof offset === "number") {
                if (limit && typeof limit === "number" && limit > 0) {
                    query += ` LIMIT ?, ?`;
                    values.push(offset, limit);
                }
            }
            else {
                if (limit && typeof limit === "number" && limit > 0) {
                    query += ` LIMIT ?`;
                    values.push(limit);
                }
            }
        }
        else {
            query = `SELECT order_id, user_id, agency_id, service_type, name_sender, phone_number_sender, name_receiver, phone_number_receiver, mass, height, width, length, province_source, district_source, ward_source, detail_source, province_dest, district_dest, ward_dest, detail_dest, long_source, lat_source, long_destination, lat_destination, fee, journey, COD, shipper, status_code, miss, qrcode, paid, created_at, last_update FROM ${table}`;
    
            if (offset && typeof offset === "number") {
                if (limit && typeof limit === "number" && limit > 0) {
                    query += ` LIMIT ?, ?`;
                    values.push(offset, limit);
                }
            }
            else {
                if (limit && typeof limit === "number" && limit > 0) {
                    query += ` LIMIT ?`;
                    values.push(limit);
                }
            }
        }

    const result = await pool.query(query, values);

    for (const elm of result[0]) {
        try {
            if (elm.journey) {
                elm.journey = JSON.parse(elm.journey);
            }   
        } catch (error) {
            // Nothing to do
        }
    }

    return result[0];
}

const getOrderForUpdating = async (order_id) => {
    const result = await SQLutils.findOneIntersect(pool, table, ["order_id"], order_id);
    return result;
};

const createNewOrder = async (newOrder, postalCode = null) => {
    const ordersTable = postalCode ? postalCode + '_' + table : table;
    return await SQLutils.insert(pool, ordersTable, Object.keys(newOrder), Object.values(newOrder));
}

const updateOrder = async (info, conditions, postal_code = null) => {
    const fields = Object.keys(info);
    const values = Object.values(info);

    const conditionFields = Object.keys(conditions);
    const conditionValues = Object.values(conditions);

    const ordersTable = postal_code ? postal_code + '_orders' : table;
    return await SQLutils.updateOne(pool, ordersTable, fields, values, conditionFields, conditionValues);
};

const cancelOrderWithTimeConstraint = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 30);
    const formattedTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
    const whereClause = `${fields.map(field => `${field} = ?`).join(" AND ")} AND order_time > ?`;
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    const result = await pool.query(query, [...values, formattedTime]);
    return result[0];
};

const cancelOrderWithoutTimeConstraint = async (conditions) => {
    const fields = Object.keys(conditions);
    const values = Object.values(conditions);

    return SQLutils.deleteOne(pool, table, fields, values);
}

const getProvincePostalCode = async (province) => {
    const table = "province";
    const query = `SELECT postal_code FROM ${table} WHERE province = ?`;
    const result = await pool.query(query, [province]);
    return result[0][0].postal_code;
}

// SELECT COUNT(*) as table_exists
// FROM information_schema.tables
// WHERE table_schema = 'tdlogistics'
// AND table_name = 'agency';

const findingManagedAgency = async (ward, district, province) => {
    const table = "ward";
    const query = `SELECT agency_id, postal_code, shipper FROM ${table} WHERE ward = ? AND district = ? AND province = ? LIMIT 1`;
    const result = await pool.query(query, [ward, district, province]);

    if (!result || !result[0] || result[0].length === 0) {
        throw new Error(`${ward}, ${district}, ${province} không tồn tại.`);
    }

    if(!result[0][0].agency_id || !result[0][0].postal_code) {
        throw new Error(`Xin lỗi quý khách. Dịch vụ chúng tôi chưa có mặt ở ${ward}, ${district}, ${province}.`);
    }

    if (!result[0][0].shipper) {
        throw new Error("Xin lỗi quý khách. Khu vực của quý khách hiện chưa có shipper nào phục vụ.");
    }
    
    return {
        postal_code: result[0][0].postal_code,
        agency_id: result[0][0].agency_id,
        shipper: result[0][0].shipper,
    }
}

const createOrderInAgencyTable = async (newOrder, postal_code) => {
    const agencyTable = postal_code + "_orders";
    return await SQLutils.insert(pool, agencyTable, Object.keys(newOrder), Object.values(newOrder));
}

const getOrderStatus = async (order_id) => {
    const ordersTable = "orders";
    const agencyTable = "agency";
    const statusQuery = `SELECT journey, status_code FROM ${ordersTable} WHERE order_id = ?`;
    const [row] = await pool.query(statusQuery, [order_id]);

    if(row.length <= 0) {
        const error = new Error("Không tồn tại đơn hàng!");
        error.status = 404;
        throw error;
    }

    const { status_code, journey } = row[0];
    const journeyArray = JSON.parse(journey);
    const lastJourney = journeyArray[journeyArray.length - 1];
    const locationCoordinate = JSON.parse(lastJourney.location);
    const [latitude, longitude] = locationCoordinate;
    const timeInterval = lastJourney.date;

    let agencyName;
    let statusMessage = timeInterval + ": ";
    const agencyQuery = `SELECT agency_name FROM ${agencyTable} WHERE latitude = ? AND longitude = ?`;

    switch (status_code) {
        case 1:
            statusMessage = statusMessage + "Giao hàng thành công";
            break;
        case 2:
            try {
                const [agency] = await pool.query(agencyQuery, [latitude, longitude]);
                agencyName = agency[0].agency_name;
                statusMessage = statusMessage + "Đang được xử lí bởi " + agencyName;
                break;
            } catch (error) {
                throw new Error (error);
            }
            
        case 3:
            statusMessage = statusMessage + "Chờ lấy hàng";
            break;
        case 4:
            try {
                const [agency] = await pool.query(agencyQuery, [latitude, longitude]);
                agencyName = agency[0].agency_name;
                statusMessage = statusMessage + "Đã tới bưu cục " + agencyName;
                break;
            } catch (error) {
                throw new Error (error);
            }
        case 5:
            try {
                const [agency] = await pool.query(agencyQuery, [latitude, longitude]);
                agencyName = agency[0].agency_name;
                statusMessage = statusMessage + "Đã rời bưu cục " + agencyName;
                break;
            } catch (error) {
                throw new Error (error);
            }
        case 6:
            statusMessage = statusMessage + "Đang giao tới người nhận";
            break;
        case 7:
            statusMessage = statusMessage + "Lấy hàng thất bại";
            break;
        case 8:
            statusMessage = statusMessage + "Giao hàng thất bại";
            break;
        case 9:
            statusMessage = statusMessage + "Đang hoàn hàng";
            break;
        case 10:
            statusMessage = statusMessage + "Hoàn hàng thành công";
            break;
        case 11:
            try {
                const [agency] = await pool.query(agencyQuery, [latitude, longitude]);
                agencyName = agency[0].agency_name;
                statusMessage = statusMessage + "Hoàn hàng thất bại, kiện hàng đang ở " + agencyName;
                break;
            } catch (error) {
                throw new Error (error);
            }
        case 12:
            statusMessage = statusMessage + "Đã hủy yêu cầu vận chuyển";
            break;
        default:
            const error = new Error ("Trạng thái không xác định");
            error.status = 400;
            throw error;
    }
    return {
        status_code: status_code,
        status_message: statusMessage
    }
}
const setStatusToOrder = async (orderInfo, orderStatus, isUpdateJourney = false) => {

    if(isUpdateJourney) {
        if(!orderInfo.managed_by) {
            return new Object({
                success: false,
                data: null,
                message: "Không đủ thông tin để thực hiện thao tác trên!"
            });
        }        
        const currentTime = new Date();
        const settingTime = moment(currentTime).format("DD-MM-YYYY ss:mm:HH");
    
        const getJourneyQuery = `SELECT journey FROM ${table} WHERE order_id = ?`;
        const [getJourneyResult] = await pool.query(getJourneyQuery, orderInfo.order_id);
        let journey;
        try {
            journey = getJourneyResult[0].journey ? JSON.parse(getJourneyResult[0].journey) : new Array();
        } catch (error) {
            journey = new Array();
        }
        
        const newOrderLocation = new Object({
            shipment_id: orderInfo.shipment_id,   
            managed_by: orderInfo.managed_by,
            date: settingTime
        });

        journey.push(newOrderLocation);

        const result = await SQLutils.updateOne(pool, table, ["journey", "status_code"], [JSON.stringify(journey), orderStatus.code], ["order_id"], [orderInfo.order_id]);
        if(result.affectedRows === 0) {
            return new Object({
                success: false,
                data: null,
                message: "Cập nhật thất bại!"
            });
        }

        return new Object({
            success: true,
            data: {
                newOrderLocation: newOrderLocation,
                newStatus: orderStatus
            },
            message: `${newOrderLocation.date}: Đơn hàng mã ${orderInfo.order_id} được tiếp nhận bởi ${newOrderLocation.managed_by}`
        });

    } else {
        const result = await SQLutils.updateOne(pool, table, ["status_code"], [orderStatus.code], ["order_id"], [orderInfo.order_id]);
        if(result.affectedRows <= 0) {
            return new Object({
                success: false,
                data: null,
                message: "Cập nhật thất bại!"
            });
        }

        return new Object({
            success: true,
            data: {
                newStatus: orderStatus
            },
            message: `Trạng thái ${orderStatus.message} được cập nhật cho đơn hàng mã ${orderInfo.order_id}`
        });
    }
}

const setJourney = async (order_id, orderMessage, orderStatus, postalCode) => {
    const orderTable = postalCode ? postalCode + '_orders' : table;
    const getJourneyQuery = `SELECT journey FROM ${table} WHERE order_id = ?`;
    const [getJourneyResult] = await pool.query(getJourneyQuery, order_id);
    let journey;
    try {
        journey = getJourneyResult[0].journey ? JSON.parse(getJourneyResult[0].journey) : new Array();
    } catch (error) {
        journey = new Array();
    }

    journey.push(orderMessage);

    return await SQLutils.updateOne(pool, orderTable, ["journey", "status_code"], [JSON.stringify(journey), orderStatus.code], ["order_id"], [order_id]);

}

module.exports = {
    checkExistOrder,
    getOrderForUpdating,
    getOrdersOfAgency,
    getOneOrder,
    getOrders,
    createNewOrder,
    updateOrder,
    cancelOrderWithTimeConstraint,
    cancelOrderWithoutTimeConstraint,
    getProvincePostalCode,
    findingManagedAgency,
    createOrderInAgencyTable,
    getOrderStatus,
    setStatusToOrder,
    setJourney,
};