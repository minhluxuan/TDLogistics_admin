const authorizationService = require("../services/authorizationService");
const staffsService = require("../services/staffsService");
const validation = require("../lib/validation");
const { text } = require("express");

const authorizationValidation = new validation.AuthorizationValidation();

const getPermissionByRole = async (req, res) => {
    try {
        const { error } = validation.validateFindingAuthorizationByRole(req.query);

        if (error) {
            return res.status(400).json({
                error: true, 
                message: error.message,
            });
        }

        const result = await authorizationService.getPermissionByRole(req.query.role);
        
        if (!result || result.length <= 0) {
            return res.status(404).json({
                error: true,
                message: "Vai trò không tồn tại.",
            });
        }

        return res.status(200).json({
            error: false,
            data: result,
            message: "Lấy quyền thành công.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const grantPermissions = async (req, res) => {
    try {
        const { error } = authorizationValidation.validateFindingAuthorization(req.query) || authorizationValidation.validateUpdatingAuthorization(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (req.user.role !== "ADMIN" && req.user.role !== "AGENCY_MANAGER") {
            return res.status(403).json({
                error: true,
                message: "Người dùng không được phép truy cập tài nguyên này.",
            });
        }

        const granterIdSubParts = req.user.staff_id.split('_');
        const receiverIdSubParts = req.query.staff_id.split('_');
        const grantedPermissions = req.body.permissions;

        if (granterIdSubParts[0] === "BC" || granterIdSubParts[0] === "DL") {
            if (granterIdSubParts[1] !== receiverIdSubParts[1]) {
                return res.status(404).json({
                    error: true,
                    message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${granterIdSubParts[1]}`,
                });
            }
        }

        const receiver = await staffsService.getOneStaff({ staff_id: req.query.staff_id });
        if (!receiver || receiver.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
            });
        }

        const receiverRole = receiver[0].role;
        if (!receiverRole) {
            return res.status(409).json({
                error: true,
                message: `Cấp quyền không thành công. Nhân viên có mã nhân viên ${req.query.staff_id} không có vai trò.`,
            });
        }

        const resultGettingAuthorizationOfReceiver = await authorizationService.getPermissionByRole(receiverRole);
        if (!resultGettingAuthorizationOfReceiver || resultGettingAuthorizationOfReceiver.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Vai trò ${receiverRole} không tồn tại.`,
            });
        }
        const primaryPermissionsOfReceiver = resultGettingAuthorizationOfReceiver[0].permissions ? JSON.parse(resultGettingAuthorizationOfReceiver[0].permissions) : new Array();
        const privilegesOfReceiver = receiver[0].privileges ? JSON.parse(receiver[0].privileges) : new Array();

        const resultGettingAuthorizationOfGranter = await authorizationService.getPermissionByRole(req.user.role);
        if (!resultGettingAuthorizationOfGranter || resultGettingAuthorizationOfGranter.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Vai trò ${req.user.role} không tồn tại.`,
            });
        }
        const primaryPermissionOfGranter = resultGettingAuthorizationOfGranter[0].permissions ? JSON.parse(resultGettingAuthorizationOfGranter[0].permissions) : new Array();

        const acceptedToGrantPermission = new Array();
        
        for (const permission of grantedPermissions) {
            if (primaryPermissionOfGranter.includes(permission)
            && !primaryPermissionsOfReceiver.includes(permission)
            && !privilegesOfReceiver.includes(permission)) {
                acceptedToGrantPermission.push(permission);
                privilegesOfReceiver.push(permission);
            }
        }
    
        let textResultGrantPermissionForStaffInAgency;
        if (receiverIdSubParts[0] === "BC" || receiverIdSubParts[0] === "DL") {
            const resultGrantPermissionForStaffInAgency = await authorizationService.grantPermissions(req.query.staff_id, privilegesOfReceiver, receiverIdSubParts[1]);
            if (!resultGrantPermissionForStaffInAgency || resultGrantPermissionForStaffInAgency.length <= 0) {
                textResultGrantPermissionForStaffInAgency = `
                Cấp quyền cho nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục không thành công.
                Nhân viên có mã bưu chính ${req.query.staff_id} không tồn tại trong bưu cục mã có bưu chính ${receiverIdSubParts[1]}`;
            }
            else {
                textResultGrantPermissionForStaffInAgency = `Cấp quyền cho nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục thành công.`;
            }
        }

        let textResultGrantPermissionForStaff;
        const resultGrantPermissionForStaff = await authorizationService.grantPermissions(req.query.staff_id, privilegesOfReceiver);
        if (!resultGrantPermissionForStaff || resultGrantPermissionForStaff.length <= 0) {
            textResultGrantPermissionForStaff = `
            Cấp quyền cho nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng cục không thành công.
            Nhân viên có mã bưu chính ${req.query.staff_id} không tồn tại trong tổng cục.`;
        }
        else {
            textResultGrantPermissionForStaff= `Cấp quyền cho nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng cục thành công.`;
        }

        return res.status(200).json({
            error: false,
            message: `Kết quả:\n
            ${textResultGrantPermissionForStaff}\n
            ${textResultGrantPermissionForStaffInAgency || ""}
            Các quyền đã được cấp thành công: ${acceptedToGrantPermission.join(", ")}.`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
}

const revokePermissions = async (req, res) => {
    try {
        const { error } = authorizationValidation.validateFindingAuthorization(req.query) || authorizationValidation.validateUpdatingAuthorization(req.body);

        if (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        if (req.user.role !== "ADMIN" && req.user.role !== "AGENCY_MANAGER") {
            return res.status(403).json({
                error: true,
                message: "Người dùng không được phép truy cập tài nguyên này.",
            });
        }

        const granterIdSubParts = req.user.staff_id.split('_');
        const receiverIdSubParts = req.query.staff_id.split('_');
        const grantedPermissions = req.body.permissions;

        if (granterIdSubParts[0] === "BC" || granterIdSubParts[0] === "DL") {
            if (granterIdSubParts[1] !== receiverIdSubParts[1]) {
                return res.status(404).json({
                    error: true,
                    message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại trong bưu cục có mã bưu chính ${granterIdSubParts[1]}`,
                });
            }
        }

        const receiver = await staffsService.getOneStaff({ staff_id: req.query.staff_id });
        if (!receiver || receiver.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Nhân viên có mã nhân viên ${req.query.staff_id} không tồn tại.`,
            });
        }

        const privilegesOfReceiver = receiver[0].privileges ? JSON.parse(receiver[0].privileges) : new Array();

        const resultGettingAuthorizationOfGranter = await authorizationService.getPermissionByRole(req.user.role);
        if (!resultGettingAuthorizationOfGranter || resultGettingAuthorizationOfGranter.length <= 0) {
            return res.status(404).json({
                error: true,
                message: `Vai trò ${req.user.role} không tồn tại.`,
            });
        }
        const primaryPermissionOfGranter = resultGettingAuthorizationOfGranter[0].permissions ? JSON.parse(resultGettingAuthorizationOfGranter[0].permissions) : new Array();

        const acceptedToGrantPermission = new Array();
        
        for (let i = 0; i < grantedPermissions; i++) {
            if (primaryPermissionOfGranter.includes(grantedPermissions[i])
            && privilegesOfReceiver.includes(grantedPermissions[i])) {
                acceptedToGrantPermission.push(grantedPermissions[i]);
                privilegesOfReceiver.splice(i, 1);
            }
        }
    
        let textResultGrantPermissionForStaffInAgency;
        if (receiverIdSubParts[0] === "BC" || receiverIdSubParts[0] === "DL") {
            const resultGrantPermissionForStaffInAgency = await authorizationService.revokePermissions(req.query.staff_id, privilegesOfReceiver, receiverIdSubParts[1]);
            if (!resultGrantPermissionForStaffInAgency || resultGrantPermissionForStaffInAgency.length <= 0) {
                textResultGrantPermissionForStaffInAgency = `
                Xóa quyền của nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục không thành công.
                Nhân viên có mã bưu chính ${req.query.staff_id} không tồn tại trong bưu cục mã có bưu chính ${receiverIdSubParts[1]}`;
            }
            else {
                textResultGrantPermissionForStaffInAgency = `Xóa quyền của nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu bưu cục thành công.`;
            }
        }

        let textResultGrantPermissionForStaff;
        const resultGrantPermissionForStaff = await authorizationService.revokePermissions(req.query.staff_id, privilegesOfReceiver);
        if (!resultGrantPermissionForStaff || resultGrantPermissionForStaff.length <= 0) {
            textResultGrantPermissionForStaff = `
            Xóa quyền của nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng cục không thành công.
            Nhân viên có mã bưu chính ${req.query.staff_id} không tồn tại trong tổng cục.`;
        }
        else {
            textResultGrantPermissionForStaff= `Xóa quyền của nhân viên có mã nhân viên ${req.query.staff_id} trong cơ sở dữ liệu tổng cục thành công.`;
        }

        return res.status(200).json({
            error: false,
            message: `Kết quả:\n
            ${textResultGrantPermissionForStaff}\n
            ${textResultGrantPermissionForStaffInAgency || ""}
            Các quyền đã được xóa thành công: ${acceptedToGrantPermission.join(", ")}.`
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
    getPermissionByRole,
    grantPermissions,
    revokePermissions,
}