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

const checkExistOrder = async (order_id) => {
    const result = await SQLutils.findOne(pool, table, ["order_id"], [order_id]);
    return result.length > 0;
};

const getOrdersByUserID = async (user_id, status_code = null) => {
    let conditionFields = ["user_id"];
    let conditionValues = [user_id];
    if(status_code !== null) {
        conditionFields.push("status_code");
        conditionValues.push(status_code);
    }

    const rows = await SQLutils.find(pool, table, conditionFields, conditionValues);
    const orders = rows.map(row => ({
        order_id: rows[0].order_id,
        name_sender: rows[0].name_sender,
        phone_sender: rows[0].phone_sender,
        name_reciever: rows[0].name_reciever,
        phone_reciever: rows[0].phone_reciever,
        order_time: rows[0].order_time
    }));
    return orders;
}

const getOrderByOrderID = async (order_id) => {
    const [row] = await SQLutils.findOne(pool, table, ["order_id"], [order_id]);
    const {status_message} = await getOrderStatus(row.order_id);
    
    const Order = new Object ({
        order_id: row.order_id,
        name_sender: row.name_sender,
        phone_sender: row.phone_sender,
        name_reciever: row.name_reciever,
        phone_reciever: row.phone_reciever,
        order_time: row.order_time,
        mass: row.mass,
        height: row.height,
        width: row.width,
        length: row.length,	
        address_source: row.address_source,	
        address_dest: row.address_dest,	
        fee: row.fee,
        COD: row.COD,
        service_type: (row.service_type === 1 ? "Giao hàng tiêu chuẩn" : "Giao hàng nhanh"),	
        status_message: status_message
    });
    return Order;
}

// const getAllOrders = async () => {
//     return await SQLutils.find(pool, table);
// };

const getOrderForUpdating = async (order_id) => {
    const result = await SQLutils.findOneIntersect(pool, table, ["order_id"], order_id);
    return result[0];
};

const createNewOrder = async (newOrder) => {
    return await SQLutils.insert(pool, table, Object.keys(newOrder), Object.values(newOrder));
}

const updateOrder = async (fields, values, conditionFields, conditionValues) => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 30);
    const formattedTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
    
    const setClause = `${fields.map(field => `${field} = ?`).join(", ")}`;
    const whereClause = `${conditionFields.map(field => `${field} = ?`).join(" AND ")} AND order_time > ?`;

    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    const result = await pool.query(query, [...values, ...conditionValues, formattedTime]);
    return result[0];
};

const cancelOrder = async (fields, values) => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 30);
    const formattedTime = moment(currentTime).format("YYYY-MM-DD HH:mm:ss");
    const whereClause = `${fields.map(field => `${field} = ?`).join(" AND ")} AND order_time > ?`;
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    
    const result = await pool.query(query, [...values, formattedTime]);
    return result[0];
};

const getDistrictPostalCode = async (district, province) => {
    
    const table = "district";
    const query = `SELECT postal_code FROM ${table} WHERE district = ? AND province = ?`;
    const result = await pool.query(query, [district, province]);
    return result[0][0].postal_code;
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

    // const postal_code = await getDistrictPostalCode(district, province);
    // if(!postal_code) {
    //     // throw new Error("Không tìm thấy mã bưu chính!");
    //     return {
    //         sucess: false,
    //         data: {
    //             postal_code: null,
    //             agency_id: null,
    //         },
    //         message: "Không tìm thấy mã bưu chính!"
    //     }
    // } 

    const table = "ward";
    const query = `SELECT agency_id, postal_code FROM ${table} WHERE ward = ? AND district = ? AND province = ?`;
    const result = await pool.query(query, [ward, district, province]);
    console.log(result[0][0].agency_id, result[0][0].postal_code);
    if(!result[0][0].agency_id || !result[0][0].postal_code) {
        // throw new Error("Không tồn tại bưu cục tại xã/thị trấn!");
        return {
            sucess: false,
            data: {
                postal_code: null,
                agency_id: null,
            },
            message: "Không tồn tại bưu cục tại xã/thị trấn!"
        }
    }
    
    return {
        sucess: true,
        data: {
            postal_code: result[0][0].postal_code,
            agency_id: result[0][0].agency_id,
        },
        message: "Lấy thông tin thành công!"
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

const distributeOrder = async (agency_id, address_source) => {
    const staffTable = "staff";
    const staffRole = "Shipper";
    const activeStatus = 1;
    const map = new libMap.Map();
    
    const rows = await SQLutils.find(pool, staffTable, ["agency_id", "role", "active"], [agency_id, staffRole, activeStatus]);
    const source = await map.convertAddressToCoordinate(address_source);
    let shipperListByMinDistance = [];
    console.log(rows);
    for (const row of rows) {
        let { staff_id, fullname, last_location } = row;
        last_location = JSON.parse(last_location);
        const shipperCoordinate = {
            lat: last_location[0],
            long: last_location[1]
        }
        
        const distance = (await map.calculateDistance(source, shipperCoordinate)).distance;
        console.log(distance);
        shipperListByMinDistance.push({
            staff_id,
            fullname,
            distance,
        });
    }
    shipperListByMinDistance.sort((a, b) => a.distance - b.distance);


    const selectedStaffid = shipperListByMinDistance[0].staff_id;
    const selectedStaffname = shipperListByMinDistance[0].fullname;

    return {
        selectedStaffid: selectedStaffid,
        selectedStaffname: selectedStaffname,
        shipperList: shipperListByMinDistance
    }

}

module.exports = {
    checkExistOrder,
    getOrderForUpdating,
    getOrdersByUserID,
    getOrderByOrderID,
    createNewOrder,
    updateOrder,
    cancelOrder,
    getDistrictPostalCode,
    getProvincePostalCode,
    findingManagedAgency,
    createOrderInAgencyTable,
    getOrderStatus,
    distributeOrder,
    
};