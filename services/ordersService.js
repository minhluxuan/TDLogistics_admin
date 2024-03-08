const Orders = require("../database/Orders");
const ExcelJS = require("exceljs");
const { OrderValidation } = require("../lib/validation");

const checkFileFormat = async (filename) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filename);
        const worksheet = workbook.getWorksheet(1);
        const row1 = worksheet.getRow(1);
        const headers = row1.values.filter(value => value !== null && value !== undefined && value !== '').map(value => value.toString());
        
        const mandatoryFields = ["STT", "name_sender", "phone_number_sender", "name_receiver", "phone_number_receiver",
        "mass", "height", "width", "length", "province_source", "district_source", "ward_source", "detail_source",
        "province_dest", "district_dest", "ward_dest", "detail_dest", "long_source", "lat_source", "long_destination", "lat_destination",
        "COD", "service_type"];

        const mandatoryFieldsAddress = ["A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1", "I1", "J1", "K1", "L1", "M1", "N1", "O1", "P1", "Q1", "R1", "S1", "T1", "U1", "V1", "W1"];
        
        for (const cell of headers) {
            if (!mandatoryFields.includes(cell)) {
                return new Object({
                    valid: false,
                    message: `Trường "${cell}" không được cho phép.`
                });
            }
        }

        for (let i = 0; i < 22; i++) {
            if (!headers.includes(mandatoryFields[i])) {
                return new Object({
                    valid: false,
                    message: `Thiếu trường ${mandatoryFields[i]}.`,
                });
            }
            
            if (worksheet.getCell(mandatoryFieldsAddress[i]) != mandatoryFields[i]) {
                return new Object({
                    valid: false,
                    message: `Ô ${mandatoryFieldsAddress[i]} được yêu cầu phải là trường "${mandatoryFields[i]}". Trong khi đó, ô ${mandatoryFieldsAddress[i]} của bạn là ${worksheet.getCell(mandatoryFieldsAddress[i])}.`,
                });
            }
        }

        const ordersValidation = new OrderValidation();

        let errorFlag = false;
        let errorMessage;

        worksheet.eachRow((row, rowNumber) => {
            if (errorFlag) {
                return;
            }

            const rowData = new Object();
            if (rowNumber !== 1) {
                row.eachCell((cell, colNumber) => {
                    rowData[headers[colNumber - 1]] = cell.value;
                });

                const { error } = ordersValidation.validateCreatingOrderByAdmin(rowData);
                if (error) {
                    errorMessage = `Hàng ${rowNumber} có định dạng dữ liệu không hợp lệ.
                    Lỗi: ${error.message}.`;
                    errorFlag = true;
                    return;
                }
            }
        });

        if (errorFlag) {
            return new Object({
                valid: false,
                message: errorMessage,
            });
        }

        return new Object({
            valid: true,
            message: "Định dạng file hợp lệ.",
        });
    } catch (error) {
        console.log(error);
        throw new Error("Lỗi khi kiểm tra định dạng file.");
    }
}

const getOrdersFromFile = async (filename) => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filename);
        const worksheet = workbook.getWorksheet(1);
        const row1 = worksheet.getRow(1);
        const headers = row1.values.filter(value => value !== null && value !== undefined && value !== '').map(value => value.toString());

        const orders = new Array();
        worksheet.eachRow((row, rowNumber) => {
            const rowData = new Object();
            if (rowNumber !== 1) {
                row.eachCell((cell, colNumber) => {
                    rowData[headers[colNumber - 1]] = cell.value;
                });

                orders.push(rowData);
            }
        });

        return orders;
    } catch (error) {
        console.log(error);
        throw new Error("Lỗi khi lấy đơn hàng từ file.");
    }
}

const checkExistOrder = async (info) => {
    return Orders.checkExistOrder(info);
};
//just use for update order
const getOrderForUpdating = async (order_id) => {
    return await Orders.getOrderForUpdating(order_id);
}

const getOrdersOfAgency = async (postalCode, conditions, paginationConditions) => {
    return await Orders.getOrdersOfAgency(postalCode, conditions, paginationConditions);
}

const getOneOrder = async (conditions) => {
    return await Orders.getOneOrder(conditions);
}

const getOrders = async (conditions, paginationConditions) => {
    return await Orders.getOrders(conditions, paginationConditions);
}

const updateOrder = async (info, conditions) => {
    return await Orders.updateOrder(info, conditions);
};

const createNewOrder = async (newOrder) => {
    return await Orders.createNewOrder(newOrder);
}

const cancelOrderWithTimeConstraint = async (conditions) => {
    return await Orders.cancelOrderWithTimeConstraint(conditions);
};

const cancelOrderWithoutTimeConstraint = async (conditions) => {
    return await Orders.cancelOrderWithoutTimeConstraint(conditions);
}

const getDistrictPostalCode = async (district, province) => {
    return await Orders.getDistrictPostalCode(district, province);
}

const getProvincePostalCode = async (province) => {
    return await Orders.getProvincePostalCode(province);
}

const findingManagedAgency = async (ward, district, province) => {
    return await Orders.findingManagedAgency(ward, district, province);
}

const createOrderInAgencyTable = async (newOrder, postalcode) => {
    return await Orders.createOrderInAgencyTable(newOrder, postalcode);
}

const getOrderStatus = async (order_id) => {
    return await Orders.getOrderStatus(order_id);
}
const distributeOrder = async (agency_id, address_source) => {
    return await Orders.distributeOrder(agency_id, address_source);
}

module.exports = {
    checkExistOrder,
    getOrderForUpdating,
    getOrdersOfAgency,
    getOneOrder,
    getOrders,
    checkFileFormat,
    getOrdersFromFile,
    createNewOrder,
    updateOrder,
    cancelOrderWithTimeConstraint,
    cancelOrderWithoutTimeConstraint,
    getDistrictPostalCode,
    getProvincePostalCode,
    findingManagedAgency,
    createOrderInAgencyTable,
    getOrderStatus,
    distributeOrder
};