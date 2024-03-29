const Joi = require("joi");
require("dotenv").config();
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);
const logger = require("../lib/logger");
  
const shortenName = async (fullname) => {
    const words = fullname.split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase());
    return initials.join('');
}

class StaffValidation {
    validateLoginStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().pattern(new RegExp(process.env.REGEX_CCCD)).min(10).max(15).required(),
            password: Joi.string().required(),
        }).strict();

        return schema.validate(data);
    }

    validateCheckingExistStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().pattern(new RegExp(process.env.REGEX_CCCD)).required(),
        }).strict();

        return schema.validate(data);
    }

    validateCreatingStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().required(),
            username: Joi.string().required(),
            password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces()
            .required(),
            date_of_birth: Joi.string().pattern(new RegExp(process.env.REGEX_BIRTHDAY)).required(), 
            cccd: Joi.string().alphanum().required(),
            email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            role: Joi.string().required(),
            salary: Joi.number().precision(3).min(0).required(), 
            paid_salary: Joi.number().precision(3).min(0).required(), 
            address: Joi.string().required(),
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
        }).strict();

        return schema.validate(data);
    }

    validateFindingStaffByStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().pattern(new RegExp("^[0-9]+$")).required(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingStaffByAdmin = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().alphanum(),
            date_of_birth: Joi.string().pattern(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(), 
            email: Joi.string().email(),
            phone_number: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")),
            role: Joi.string().alphanum(), 
            salary:Joi.number().precision(3).min(0) , 
            paid_salary:Joi.number().precision(3).min(0), 
            address: Joi.string(),
            agency_id: Joi.string().alphanum(),
            staff_id: Joi.string().alphanum().min(9).max(9),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatingStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().lowercase().pattern(new RegExp(process.env.REGEX_NAME)),
            username: Joi.string(),
            date_of_birth: Joi.string().pattern(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(),
            email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            role: Joi.string(),
            salary: Joi.number().precision(3).min(0), 
            paid_salary: Joi.number().precision(3).min(0), 
            address: Joi.string(), 
            agency_id: Joi.number().max(99999),
        }).strict();

        return schema.validate(data);
    }

    validateDeletingStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().alphanum().min(9).max(9).required(),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatePassword=(data)=>{
        const schema = Joi.object({
            new_password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces()
            .required(),
            confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
        }).strict();
        return schema.validate(data);
    }
}

class ShipmentValidation {
    validateCreatingShipment = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().required(),
            transport_partner_id: Joi.string().alphanum(),
            long_source: Joi.number().min(-180).max(180).required(),
            lat_source: Joi.number().min(-90).max(90).required(),
            long_destination: Joi.number().min(-180).max(180).required(),
            lat_destination: Joi.number().min(-90).max(90).required(),
            route: Joi.string().required(),
        }).strict();
        
        return schema.validate(data);
    }

    validateUpdatingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
            mass: Joi.number().precision(2).required(),
        }).strict();
        return schema.validate(data);
    }
    
    validateFindingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        }).strict();
        return schema.validate(data);
    }

    validateDecomposingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        }).strict();
        return schema.validate(data);
    }

    validateShipmentID = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        }).strict();
        return schema.validate(data);
    }

}

class ContainerValidation {
    validateCreatingContainer = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            type: Joi.string().required(),
        }).strict();
        
        return schema.validate(data);
    }

    validateUpdatingContainer = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            choice: Joi.string().required(),
        }).strict();
        
        return schema.validate(data);
    }

    validateFindingContainer = (data) => {
        const schema = Joi.object({
            container_id: Joi.string().required(),
        }).strict();
        
        return schema.validate(data);
    }
}

class BusinessValidation {
    validateCreateBusiness = (data) => {
        const schema = Joi.object({
            business_name: Joi.string().required(),
            username: Joi.string().required(),
            password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces()
            .required(),
            tax_number: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")).required(), 
            email: Joi.string().email().required(),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(), 
            address: Joi.string().required(),
            postal_code:Joi.string().pattern(new RegExp("^[0-9]+$")).required()
        }).strict();
        return schema.validate(data);
    }

    validateFindingBusinessByBusiness = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().pattern(new RegExp("^[0-9]{1,7}$"))
        });

        return schema.validate(data);
    }

    validateFindingBusinessByAdmin = (data) => {
        const schema = Joi.object({
            business_name: Joi.string().alphanum(),
            tax_number: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")), 
            email: Joi.string().email(),
            phone_number: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")),
            address: Joi.string(),
            postal_code: Joi.string().pattern(new RegExp("^[0-9]+$")),
            business_id: Joi.string().pattern(new RegExp("^[0-9]+$")),
            debit: Joi.number(),
            active: Joi.boolean(),
            debit: Joi.number()
        }).strict();

        return schema.validate(data);
    }

    validateCheckingExistBusiness = (data) => {
        const schema = Joi.object({
            tax_number: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")).required(),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatingBusiness = (data) => {
        const schema = Joi.object({
            business_name: Joi.string().alphanum(),
            email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            debit: Joi.number().precision(3).min(0), 
            address: Joi.string(), 
            postalCode:Joi.string().pattern(new RegExp("^[0-9]+$")),
            active: Joi.boolean()

        }).strict();

        return schema.validate(data);
    }

    validateDeletingBusiness = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().alphanum().min(7).max(7).required(),
        }).strict();

        return schema.validate(data);
    }
}

class VehicleValidation {
    validateCheckingExistVehicle = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().required(),
        });
        return schema.validate(data);
    };

    validateFindingVehicle = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string(),
            transport_partner_id: Joi.string(),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            type: Joi.string(),
            license_plate: Joi.string().regex(new RegExp(process.env.REGEX_LICENSE_PLATE)),
            mass: Joi.number(),
        }).unknown(false);

        return schema.validate(data);
    }

    validateGettingOrderIds = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string(),
        }).strict();

        return schema.validate(data);
    }

    validateCreatingVehicle = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().required(), //not check
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            type: Joi.string().required(),
            license_plate: Joi.string().regex(new RegExp(process.env.REGEX_LICENSE_PLATE)).required(),
            max_load: Joi.number().required(),
        }).unknown(false);
        
        return schema.validate(data);
    };

    validateUpdatingVehicle = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string(),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            type: Joi.string(),
            license: Joi.string().regex(new RegExp(process.env.REGEX_LICENSE_PLATE)),
            max_load: Joi.number(),
            mass: Joi.number()
        }).unknown(false);

        return schema.validate(data);
    };

    validateOrderIds = (data) => {
        const schema = Joi.object({
            order_ids: Joi.array().items(Joi.string()),
        }).strict();

        return schema.validate(data);
    }

    validateDeletingVehicle = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().required(),
        }).unknown(false);

        return schema.validate(data);
    };
}

const ErrorMessage = (error) => {
    const details = error.details;

    for (let i = 0; i < details.length; i++) {
        if (details[i].type === "any.required") {
            return "Missing field: " + details[i].context.key;
        } else if (details[i].type === "string.pattern.base") {
            return "Invalid value in field: " + details[i].context.key;
        } else if (details[i].type === "object.unknown") {
            return "Unexpected field: " + details[i].context.key;
        }
    }

    return "Validation error";
}

class AuthorizationValidation {
    validateUpdatingAuthorization = (data) => {
        const schema = Joi.object({
            personnel_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            permissions: Joi.array(),
        }).strict();

        return schema.validate(data);
    }

    validateDeletingAuthorization = (data) => {
        const schema = Joi.object({
            personnel_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            permissions: Joi.array(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingAuthorization = (data) => {
        const schema = Joi.object({
            personnel_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
        }).strict();

        return schema.validate(data);
    }

    isAllowedToGrant = (granter_id, receiver_id, primaryPermissionsOfGranter, grantedPermissions) => {
        for (const permission of grantedPermissions) {
            if (!primaryPermissionsOfGranter.includes(permission)) {
                console.log("Action is not allowed.");
                return false;
            }
        }

        const orders = ["GB", "SG", "AP", "SP", "AD", "SD","AT", "ST"];

        const granterArray = granter_id.split('_');
        const receiverArray = receiver_id.split('_');

        if (orders.indexOf(granterArray[0]) > orders.indexOf(receiverArray[0])
            || orders.indexOf(granterArray[0]) > 0 && granterArray[1] !== receiverArray[1]
            || orders.indexOf(granterArray[0]) > 1 && granterArray[2] !== receiverArray[2]
            || orders.indexOf(granterArray[0]) > 2 && granterArray[3] !== receiverArray[3]) {
            console.log("Operation is not allowed.");
            return false;
        }

        return true;
    }

    isAllowedToRevoke = (revoker_id, loser_id, primaryPermissionOfRevoker, revokedPermissions) => {
        for (const permission of revokedPermissions) {
            if (!primaryPermissionOfRevoker.includes(permission)) {
                console.log("Action is not allowed.");
                return false;
            }
        }

        const orders = ["GB", "SG", "AP", "SP", "AD", "SD","AT", "ST"];

        const revokerArray = revoker_id.split('_');
        const loserArray = loser_id.split('_');

        if (orders.indexOf(revokerArray[0]) > orders.indexOf(loserArray[0])
            || orders.indexOf(revokerArray[0]) > 1 && revokerArray[1] !== loserArray[1]
            || orders.indexOf(revokerArray[0]) > 3 && revokerArray[2] !== loserArray[2]
            || orders.indexOf(revokerArray[0]) > 5 && revokerArray[3] !== loserArray[3]) {
            console.log("Action is not allowed.");
            return false;
        }

        return true;
    }

    isAllowedToRead = (reader_id, read_object_id, primaryPermissionOfReader) => {
        const orders = ["GB", "SG", "AP", "SP", "AD", "SD","AT", "ST"];

        const readerArray = reader_id.split('_');
        const readObjectArray = read_object_id.split('_');

        if (orders.indexOf(readerArray[0]) > orders.indexOf(readObjectArray[0])
            || orders.indexOf(readerArray[0]) > 1 && readerArray[1] !== readObjectArray[1]
            || orders.indexOf(readObjectArray[0]) > 3 && readerArray[2] !== readObjectArray[2]
            ||  orders.indexOf(readObjectArray[0]) > 5 && readerArray[3] !== readObjectArray[3]) {
                console.log("Action is not allowed.");
                return false;
        }

        return true;
    }
}

class PartnerStaffValidation {
    validateLoginPartnerStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().pattern(new RegExp(process.env.REGEX_CCCD)).min(10).max(15).required(),
            password: Joi.string().required(),
        }).strict();

        return schema.validate(data);
    }

    validateCheckingExistPartnerStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().pattern(new RegExp(process.env.REGEX_CCCD)).required(),
        }).strict();

        return schema.validate(data);
    }

    validateCreatingPartnerStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().required(),
            username: Joi.string().required(),
            password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces()
            .required(),
            date_of_birth: Joi.string().pattern(new RegExp(process.env.REGEX_BIRTHDAY)).required(), 
            cccd: Joi.string().alphanum().required(),
            email: Joi.string().email().required(),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            partner_id: Joi.string().alphanum().required(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingPartnerStaffByPartnerStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().pattern(new RegExp("^[0-9]+$")).required(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingPartnerStaffByAdmin = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().alphanum(),
            date_of_birth: Joi.string().pattern(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(), 
            email: Joi.string().email(),
            phone_number: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")),
            address: Joi.string(),
            agency_id: Joi.string().alphanum(),
            staff_id: Joi.string().alphanum().min(9).max(9),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatingPartnerStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().lowercase().pattern(new RegExp(process.env.REGEX_NAME)),
            username: Joi.string(),
            date_of_birth: Joi.string().pattern(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(),
            email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            address: Joi.string(), 
            partner_id: Joi.string().alphanum(),
        }).strict();

        return schema.validate(data);
    }

    validateDeletingPartnerStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().alphanum().min(9).max(9).required(),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatePartnerPassword = (data)=>{
        const schema = Joi.object({
            new_password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces()
            .required(),
            confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
        }).strict();
        return schema.validate(data);
    }
}

class TransportPartnerValidation {
    validateCreatingPartner = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().pattern(new RegExp("^(AG|AP|AD|AT)_[a-zA-Z]{2,3}_[1-9]{5}_[1-9]{5}$")).required(),
            transport_partner_id: Joi.string().pattern(new RegExp("^(DL|TC)$")).required(),
            tax_code: Joi.string().pattern(new RegExp("^[0-9]{10}$|^[0-9]{13}$")).required(),
            name: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)).required(),
            email: Joi.string().email(),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            debit: Joi.number().min(0),
        }).unknown(false);
        return schema.validate(data);
    };

    validateFindingPartner = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().pattern(new RegExp("^(AG|AP|AD|AT)_[1-9]{5}_[1-9]{5}$")),
            transport_partner_id: Joi.string().pattern(new RegExp("^(DL|TC)[0-9]{5}$")),
            tax_code: Joi.string().pattern(new RegExp("^[0-9]{10}$|^[0-9]{13}$")),
            name: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)),
            email: Joi.string().email(),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            debit: Joi.number().min(0),
        }).unknown(false);
        return schema.validate(data);
    };

    validateUpdatePartner = (data) => {
        const schema = Joi.object({
            tax_code: Joi.string().pattern(new RegExp("^[0-9]{10}$|^[0-9]{13}$")),
            name: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)),
            email: Joi.string().email(),
            phone_number: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            debit: Joi.number(),
        }).unknown(false);
        return schema.validate(data);
    };
    
    validateDeletingPartner = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().pattern(new RegExp("^(DL|TC)[0-9]{5}$")),
        });
        return schema.validate(data);
    };
}

class AgencyValidation {
    validateCheckingExistAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().alphanum().required(),
        }).strict();
        return schema.validate(data);
    }

    validateCreatingAgency = (data) => {
        const schema = Joi.object({
            // Head officer information
            username: Joi.string().required(),
            user_password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces()
            .required(),
            user_fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            user_phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            user_email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)).required(),
            user_date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(),
            user_cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            user_address: Joi.string().required(),
            user_position: Joi.string(),
            user_deposit: Joi.number().min(0),
            user_salary: Joi.number().min(0),

            // Agency information
            level: Joi.number().min(1).max(5).required(),
            postal_code: Joi.string().regex(new RegExp(process.env.REGEX_POSTAL_CODE)).required(),
            agency_name: Joi.string().required(),
            address: Joi.string().required(),
            district: Joi.string().required(),
            province: Joi.string().required(),
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required(),
            email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)).required(),  
            commission_rate: Joi.number().min(0).max(1),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict();
        return schema.validate(data);
    }

    validateFindingByAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().pattern(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict();
        return schema.validate(data);
    }

    validateFindingAgencyByAdmin = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().pattern(new RegExp(process.env.REGEX_AGENCY_ID)),
            agency_name: Joi.string(),
            level: Joi.number().min(1).max(4),
            address: Joi.string(),
            district: Joi.string(),
            province: Joi.string(),
        }).strict();
        return schema.validate(data);
    }

    validateUpdatingAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().pattern(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
            agency_name: Joi.string(),
            level: Joi.number().min(2).max(5),
            lat_source: Joi.number().min(-90).max(90),
            long_source: Joi.number().min(-180).max(180),
            address: Joi.string(),
            district: Joi.string(),
            province: Joi.string(),
            email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)),
            password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces(),
            commission_rate: Joi.number().min(0).max(1),
            revenue: Joi.number().min(0),
            bank_number: Joi.string().alphanum(),
            bank_name: Joi.string(),
        }).strict();
        return schema.validate(data);
    }

    validateDeletingAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().pattern(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict();
        return schema.validate(data);
    }

    isAllowedToCreate = (creatorId, agency) => {
        const levels = ["AU", "AG", "AC", "AP", "AD", "AT"];
        const creatorIdArray = creatorId.split('_');
        const creatorLevel = levels.indexOf(creatorIdArray[1]);

        if (creatorIdArray[0] !== "TD") {
            logger.info(`User ${creatorId} is not permitted to create an agency with level: ${agency.level}, postal code: ${agency.postal_code}`);
            return {
                allowed: false,
                message: "Hành động không được cho phép. Người dùng không được phép truy cập tài nguyên này.",
            }
        }

        if (creatorLevel > agency.level) {
            logger.info(`User ${creatorId} is not permitted to create an agency with level: ${agency.level}, postal code: ${agency.postal_code}`);
            return {
                allowed: false,
                message: "Hành động không được cho phép. Cấp độ đại lý phải nhỏ hơn cấp độ người dùng hiện tại.",
            }
        }

        if (creatorLevel === 3 && creatorIdArray[2].slice(0, 2) !== agency.postal_code.slice(0, 2)
        || creatorLevel === 4 && creatorIdArray[2].slice(0, 4) !== agency.postal_code.slice(0, 4)
        || creatorLevel === 5 && creatorIdArray[2].slice(0, 5) !== agency.postal_code.slice(0, 5)) {
            logger.info(`User ${creatorId} is not permitted to create an agency with level: ${agency.level}, postal code: ${agency.postal_code}`);
            return {
                allowed: false,
                message: "Hành động không được cho phép. Địa phương của đại lý không thuộc quyền kiểm soát của người dùng.",
            }
        }

        logger.info(`User ${creatorId} is permitted to create an agency with level: ${agency.level}, postal code: ${agency.postal_code}`);
        return {
            allowed: true,
            message: "Hành động được cho phép.",
        }
    }

    getRoleFromLevel = (level) => {
        switch (level) {
            case 1:
                return "AGENCY_GLOBAL";
            case 2:
                return "AGENCY_COUNTRY";
            case 3:
                return "AGENCY_PROVINCE";
            case 4:
                return "AGENCY_DISTRICT";
            case 5:
                return "AGENCY_TOWN";
        }
    }
}

module.exports = {
    StaffValidation,
    ShipmentValidation,
    ContainerValidation,
    BusinessValidation,
    VehicleValidation,
    AuthorizationValidation,
    PartnerStaffValidation,
    TransportPartnerValidation,
    AgencyValidation,
    shortenName,
    ErrorMessage,
}
