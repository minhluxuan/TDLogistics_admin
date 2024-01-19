const Joi = require("joi");
require("dotenv").config();
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);

class ShipmentValidation {
    constructor(data) {
        this._data = data;
    }

    validateCreatingShipment = () => {
        const schema = Joi.object({
            staff_id: Joi.string().required(),
            transport_partner_id: Joi.string().alphanum(),
            long_source: Joi.number().min(-180).max(180).required(),
            lat_source: Joi.number().min(-90).max(90).required(),
            long_destination: Joi.number().min(-180).max(180).required(),
            lat_destination: Joi.number().min(-90).max(90).required(),
            route: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }

    validateUpdatingShipment = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
            mass: Joi.number().precision(2).min(0).required(),
        });
        return schema.validate(this._data);
    }
    
    validateFindingShipment = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(this._data);
    }

    validateDecomposingShipment = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(this._data);
    }

    validateShipmentID = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(this._data);
    }

}


class ContainerValidation {
    constructor(data) {
        this._data = data;
    }

    validateCreatingConatiner = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            type: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }

    validateUpdatingConatiner = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            choice: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }

    validateFindingConatiner = () => {
        const schema = Joi.object({
            container_id: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }
}

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
        });

        return schema.validate(data);
    }

    validateCheckingExistStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().pattern(new RegExp(process.env.REGEX_CCCD)).required(),
        });

        return schema.validate(data);
    }

    validateCreatingStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().lowercase().pattern(new RegExp(process.env.REGEX_NAME)).required(),
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
        });

        return schema.validate(data);
    }

    validateFindingStaffByStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().pattern(new RegExp("^[0-9]+$")).required(),
        });

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
        });

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
        });

        return schema.validate(data);
    }

    validateDeletingStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().alphanum().min(9).max(9).required(),
        });

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
        });
        
        return schema.validate(data);
    }

    validateUpdatingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
            mass: Joi.number().precision(2).min(0).required(),
        });
        return schema.validate(data);
    }
    
    validateFindingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(data);
    }

    validateDecomposingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(data);
    }

    validateShipmentID = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(data);
    }

}


class ContainerValidation {
    constructor(data) {
        this._data = data;
    }

    validateCreatingConatiner = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            type: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }

    validateUpdatingConatiner = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            choice: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }

    validateFindingConatiner = () => {
        const schema = Joi.object({
            container_id: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }
}


module.exports = {
    StaffValidation,
    ShipmentValidation,
    ContainerValidation,
    shortenName,
    
};

