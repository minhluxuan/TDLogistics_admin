const Joi = require("joi");
require("dotenv").config();

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

module.exports = {
    ShipmentValidation,
    ContainerValidation,
    shortenName,
};