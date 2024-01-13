const Joi = require("joi");
  
class AuthorUserRequestValidation {
    validateCreatingStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().alphanum().required(),
            dateofbirth: Joi.string().pattern(new RegExp("^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/(19|20)\d{2}$")).required(), 
            cccd: Joi.string().alphanum().required(), 
            email: Joi.string().email().required(),
            phoneNumber: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")).required(),
            role: Joi.string().alphanum().required(), 
            salary:Joi.number().precision(3).min(0).required() , 
            paid_salary:Joi.number().precision(3).min(0).required() , 
            address: Joi.string().required(), 
            agency_id: Joi.string().alphanum().required(),
        });

        return schema.validate(data);
    }

    validateFindingStaffByStaff = () => {
        const schema = Joi.object({
            staff_id: Joi.alphanum().min(9).max(9).required(),
        });

        return schema.validate(this._data);
    }

    validateFindingStaffByAdmin = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().alphanum(),
            dateofbirth: Joi.string().pattern(new RegExp("^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/(19|20)\d{2}$")), 
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
            staff_id: Joi.string().alphanum().min(9).max(9),
            fullname: Joi.string().alphanum(),
            email:Joi.string().email(),
            phone_number:Joi.string().pattern(new RegExp("^[0-9]{1,10}$")),
            salary: Joi.number(),
            deposit: Joi.number(),
            address: Joi.string().pattern(new RegExp("^[0-9A-Za-z\s.,/-']+$")),
            role: Joi.string().alphanum()
        });

        return schema.validate(data);
    }

    validateDeletingStaff = (data) => {
        const schema=Joi.object({
            staff_id: Joi.string().alphanum().min(9).max(9).required(),
        });

        return schema.validate(data);
    }
}
 
module.exports = {
    AuthorUserRequestValidation,
}