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
            route: Joi.string().required(),
        });
        
        return schema.validate(this._data);
    }

    validateUpdateShipment = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(this._data);
    }
    
    validateGetShipment = () => {
        const schema = Joi.object({
            shipment_id: Joi.string().alphanum().required(),
        });
        return schema.validate(this._data);
    }

}

const getNameLetter = async (fullname) => {
    const words = fullname.split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase());
    return initials.join('');
}

module.exports = {
    ShipmentValidation,
    getNameLetter,
};