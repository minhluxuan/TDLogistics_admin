const Joi = require("joi");
require("dotenv").config();
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);
  
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
            agency_id: Joi.number().max(99999).required(),
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

class AgencyValidation {

    validateCheckingExistAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().alphanum().required(),
        }).strict();
        return schema.validate(data);
    }

    validateCreatingAgency = (data) => {
        const schema = Joi.object({
            level: Joi.number().min(1).max(4).required(),
            agency_name: Joi.string().required(),
            lat_source: Joi.number().min(-90).max(90).required(),
            long_source: Joi.number().min(-180).max(180).required(),
            address: Joi.string().required(),
            district: Joi.string().required(),
            province: Joi.string().required(),
            email: Joi.string().pattern(new RegExp(process.env.REGEX_EMAIL)).required(),  
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
            bank_number: Joi.string(),
            bank_name: Joi.string(),
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
            level: Joi.number().min(1).max(4),
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
}

module.exports = {
    StaffValidation,
    ShipmentValidation,
    ContainerValidation,
    BusinessValidation,
    AgencyValidation,
    shortenName,
}