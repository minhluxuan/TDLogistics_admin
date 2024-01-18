const Joi = require("joi");
const { joiPasswordExtendCore } = require("joi-password");
const joiPassword = Joi.extend(joiPasswordExtendCore);

class StaffValidation {
    validateLoginStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().pattern(new RegExp(process.env.REGEX_CCCD)).min(10).max(15).required(),
            password: Joi.string().required(),
        });

        return schema.validate(data);
    };

    validateCheckingExistStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().pattern(new RegExp(process.env.REGEX_CCCD)).required(),
        });

        return schema.validate(data);
    };

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
    };

    validateFindingStaffByStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().pattern(new RegExp("^[0-9]+$")).required(),
        });

        return schema.validate(data);
    };

    validateFindingStaffByAdmin = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().alphanum(),
            date_of_birth: Joi.string().pattern(new RegExp(process.env.REGEX_BIRTHDAY)),
            cccd: Joi.string().alphanum(),
            email: Joi.string().email(),
            phone_number: Joi.string().pattern(new RegExp("^[0-9]{1,10}$")),
            role: Joi.string().alphanum(),
            salary: Joi.number().precision(3).min(0),
            paid_salary: Joi.number().precision(3).min(0),
            address: Joi.string(),
            agency_id: Joi.string().alphanum(),
            staff_id: Joi.string().alphanum().min(9).max(9),
        });

        return schema.validate(data);
    };

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
    };

    validateDeletingStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().alphanum().min(9).max(9).required(),
        });

        return schema.validate(data);
    };

    validateUpdatePassword = (data) => {
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
            confirm_password: Joi.string().valid(Joi.ref("new_password")).required(),
        }).strict();
        return schema.validate(data);
    };
}

class VehicleValidation {
    validateCheckingExistVehicle = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().required(),
        });
        return schema.validate(data);
    };

    validateCreatingVehicle = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().required(), //not check
            staff_id: Joi.string().pattern(new RegExp("^[0-9]+$")).required(),
            vehicle_id: Joi.string().required(), //not
            type: Joi.string().max(15).required(),
            license_plate: Joi.string()
                .regex(new RegExp("^(1[124-9]|2[0-9]|[3-9][0-9])[ABCEFGHKLMNPSTUVXYZ]-d{1,2}.d{2}$"))
                .required(),
            max_load: Joi.number().required(),
        });
        return schema.validate(data);
    };
}

module.exports = {
    StaffValidation,
    VehicleValidation,
};
