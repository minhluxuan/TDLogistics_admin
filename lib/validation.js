const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);
const logger = require("../lib/logger");

class StaffValidation {
    validateLoginStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).min(10).max(15).required(),
            password: Joi.string().required(),
        }).strict();

        return schema.validate(data);
    }

    validateCheckingExistStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
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
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(), 
            cccd: Joi.string().alphanum().required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            role: Joi.string().required(),
            position: Joi.string(),
            salary: Joi.number().precision(3).min(0), 
            paid_salary: Joi.number().precision(3).min(0),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingStaffByStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict();

        return schema.validate(data);
    }

    validateQueryUpdatingStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingStaffByAdmin = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            fullname: Joi.string(),
            username: Joi.string(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(), 
            email: Joi.string().email(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            role: Joi.string().alphanum(), 
            salary: Joi.number().precision(3).min(0), 
            paid_salary: Joi.number().precision(3).min(0), 
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatingStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().lowercase().regex(new RegExp(process.env.REGEX_NAME)),
            username: Joi.string(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
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
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatePassword = (data) => {
        const schema = Joi.object({
            new_password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
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
            mass: Joi.number().precision(2).min(0).required(),
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
            tax_number: Joi.string().regex(new RegExp("^[0-9]{1,10}$")).required(), 
            email: Joi.string().email().required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(), 
            address: Joi.string().required(),
            postal_code:Joi.string().regex(new RegExp("^[0-9]+$")).required()
        }).strict();
        return schema.validate(data);
    }

    validateFindingBusinessByBusiness = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().regex(new RegExp("^[0-9]{1,7}$"))
        });

        return schema.validate(data);
    }

    validateFindingBusinessByAdmin = (data) => {
        const schema = Joi.object({
            business_name: Joi.string().alphanum(),
            tax_number: Joi.string().regex(new RegExp("^[0-9]{1,10}$")), 
            email: Joi.string().email(),
            phone_number: Joi.string().regex(new RegExp("^[0-9]{1,10}$")),
            address: Joi.string(),
            postal_code: Joi.string().regex(new RegExp("^[0-9]+$")),
            business_id: Joi.string().regex(new RegExp("^[0-9]+$")),
            debit: Joi.number(),
            active: Joi.boolean(),
            debit: Joi.number()
        }).strict();

        return schema.validate(data);
    }

    validateCheckingExistBusiness = (data) => {
        const schema = Joi.object({
            tax_number: Joi.string().regex(new RegExp("^[0-9]{1,10}$")).required(),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatingBusiness = (data) => {
        const schema = Joi.object({
            business_name: Joi.string().alphanum(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            debit: Joi.number().precision(3).min(0), 
            address: Joi.string(), 
            postalCode:Joi.string().regex(new RegExp("^[0-9]+$")),
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

class AuthorizationValidation {
    validateUpdatingAuthorization = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            permissions: Joi.array(),
        }).strict();

        return schema.validate(data);
    }

    validateDeletingAuthorization = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            permissions: Joi.array(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingAuthorization = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
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
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).min(10).max(15).required(),
            password: Joi.string().required(),
        }).strict();

        return schema.validate(data);
    }

    validateCheckingExistPartnerStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
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
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(), 
            cccd: Joi.string().alphanum().required(),
            email: Joi.string().email().required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            partner_id: Joi.string().alphanum().required(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingPartnerStaffByPartnerStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp("^[0-9]+$")).required(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingPartnerStaffByAdmin = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().alphanum(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(), 
            email: Joi.string().email(),
            phone_number: Joi.string().regex(new RegExp("^[0-9]{1,10}$")),
            address: Joi.string(),
            agency_id: Joi.string().alphanum(),
            staff_id: Joi.string().alphanum().min(9).max(9),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatingPartnerStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().lowercase().regex(new RegExp(process.env.REGEX_NAME)),
            username: Joi.string(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().alphanum(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
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
            // Representor of transport partner
            username: Joi.string().required(),
            user_password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required(),
            user_fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            user_phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            user_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            user_date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)),
            user_cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            user_province: Joi.string(),
            user_district: Joi.string(),
            user_town: Joi.string(),
            user_detail_address: Joi.string(),
            user_position: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),

            // Transport partner information
            tax_code: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)),
            transport_partner_name: Joi.string().required(),
            province: Joi.string().required(),
            district: Joi.string().required(),
            town: Joi.string().required(),
            detail_address: Joi.string().required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)).required(),
            bank: Joi.string().required(),
        }).strict();

        return schema.validate(data);
    };

    validateFindingPartnerByPartnerId = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
        }).strict();

        return schema.validate(data);
    }

    validateFindingPartner = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
            tax_code: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)),
            transport_partner_name: Joi.string(),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict();

        return schema.validate(data);
    };

    validateUpdatePartner = (data) => {
        const schema = Joi.object({
            tax_code: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)),
            transport_partner_name: Joi.string(),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
            debit: Joi.number(),
        }).strict();

        return schema.validate(data);
    };
    
    validateDeletingPartner = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
        });
        return schema.validate(data);
    };
}

class AgencyValidation {
    validateCheckingExistAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
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
            user_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            user_date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)),
            user_cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            user_province: Joi.string(),
            user_district: Joi.string(),
            user_town: Joi.string(),
            user_detail_address: Joi.string(),
            user_position: Joi.string(),
            user_bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            user_bank: Joi.string(),
            user_salary: Joi.number().min(0),

            // Agency information
            type: Joi.string().valid("BC", "DL"),
            level: Joi.number().min(1).max(3).required(),
            postal_code: Joi.string().regex(new RegExp(process.env.REGEX_POSTAL_CODE)).required(),
            agency_name: Joi.string().required(),
            province: Joi.string().required(),
            district: Joi.string().required(),
            town: Joi.string().required(),
            detail_address: Joi.string(),
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required(),
            managed_wards: Joi.array().items(Joi.string()),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),  
            commission_rate: Joi.number().min(0).max(1),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict();
        return schema.validate(data);
    }

    validateFindingAgencyByAgencyId = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict();

        return schema.validate(data);
    }

    validateFindingAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)),
            agency_name: Joi.string(),
            level: Joi.number().min(1).max(5),
            address: Joi.string(),
            district: Joi.string(),
            province: Joi.string(),
        }).strict();

        return schema.validate(data);
    }

    validateUpdatingAgency = (data) => {
        const schema = Joi.object({
            agency_name: Joi.string(),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            latitude: Joi.number().min(-90).max(90).required(),
            longitude: Joi.number().min(-180).max(180).required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            revenue: Joi.number().min(0),
            commission_rate: Joi.number().min(0).max(1),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict();

        return schema.validate(data);
    }

    validateDeletingAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict();

        return schema.validate(data);
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
}