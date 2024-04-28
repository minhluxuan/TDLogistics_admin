const Joi = require("joi");
const { joiPasswordExtendCore } = require('joi-password') 
const joiPassword = Joi.extend(joiPasswordExtendCore);
const logger = require("../lib/logger");

class StaffValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
    
    validateLoginStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            password: Joi.string().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCheckingExistStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreatingStaffByAgency = (data) => {
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
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            role: Joi.string().valid("AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER", "AGENCY_DRIVER", "AGENCY_SHIPPER").required(),
            position: Joi.string(),
            salary: Joi.number().precision(3).min(0), 
            paid_salary: Joi.number().precision(3).min(0),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreatingStaffByAdmin = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
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
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            role: Joi.string().valid("MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
            "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
            "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER").required(),
            position: Joi.string(),
            salary: Joi.number().precision(3).min(0), 
            paid_salary: Joi.number().precision(3).min(0),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            managed_wards: Joi.array().items(Joi.string()),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }    

    validateFindingStaffByStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateQueryUpdatingStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingStaffByAdmin = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)),
            username: Joi.string(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)), 
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            role: Joi.string().valid("MANAGER", "HUMAN_RESOURCE_MANAGER", "TELLER", "COMPLAINTS_SOLVER",
            "AGENCY_MANAGER", "AGENCY_HUMAN_RESOURCE_MANAGER", "AGENCY_TELLER", "AGENCY_COMPLAINTS_SOLVER",
            "DRIVER", "SHIPPER", "AGENCY_DRIVER", "AGENCY_SHIPPER"), 
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdatingStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().lowercase().regex(new RegExp(process.env.REGEX_NAME)),
            username: Joi.string(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            role: Joi.string(),
            salary: Joi.number().precision(3).min(0), 
            paid_salary: Joi.number().precision(3).min(0), 
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            managed_wards: Joi.array().items(Joi.string()),
        }).min(1).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateDeletingStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

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
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }

    validateGettingStaffAvatar = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateRemovingManagedWards = (data) => {
        const schema = Joi.object({
            "removed_wards": Joi.array().items(Joi.string()).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}
 
class ShipmentValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreatingShipment = (data) => {
        const schema = Joi.object({
            agency_id_dest: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    }

    validateQueryUpdatingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdatingShipment = (data) => {
        const schema = Joi.object({
            mass: Joi.number().precision(2).min(0),
        }).min(1).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
    
    validateFindingShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID)),
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }

    validateDecomposingShipment = (data) => {
        const schema = Joi.object({
            order_ids: Joi.array().items(Joi.string().regex(new RegExp(process.env.REGEX_ORDER_ID))).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateOperationWithOrder = (data) => {
        const schema = Joi.object({
            order_ids: Joi.array().items(Joi.string().regex(new RegExp(process.env.REGEX_ORDER_ID))).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateShipmentID = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }

    validateUndertakeShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }

}

class ContainerValidation {
    validateCreatingContainer = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            type: Joi.string().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    }

    validateUpdatingContainer = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().required(),
            container_id: Joi.string().required(),
            choice: Joi.string().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    }

    validateFindingContainer = (data) => {
        const schema = Joi.object({
            container_id: Joi.string().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    }
}

class BusinessValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateSigningUp = (data) => {
        const schema = Joi.object({
            // Representor of business information
            user_fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            user_phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            user_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            user_date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(),
            user_cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            user_province: Joi.string().required(),
            user_district: Joi.string().required(),
            user_town: Joi.string().required(),
            user_detail_address: Joi.string().required(),
            user_bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            user_bank: Joi.string(),

            // Business information
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
            business_name: Joi.string().required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            tax_number: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)), 
            province: Joi.string().required(),
            district: Joi.string().required(),
            town: Joi.string().required(),
            detail_address: Joi.string().required(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)).required(),
            bank: Joi.string().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreateBusinessByAgency = (data) => {
        const schema = Joi.object({
            // Representor of business information
            user_fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            user_phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            user_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            user_date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(),
            user_cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            user_province: Joi.string().required(),
            user_district: Joi.string().required(),
            user_town: Joi.string().required(),
            user_detail_address: Joi.string().required(),
            user_bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            user_bank: Joi.string(),

            // Business information
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
            business_name: Joi.string().required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            tax_number: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)), 
            province: Joi.string().required(),
            district: Joi.string().required(),
            town: Joi.string().required(),
            detail_address: Joi.string().required(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)).required(),
            bank: Joi.string().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreateBusinessByAdmin = (data) => {
        const schema = Joi.object({
            // Representor of business information
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
            user_fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            user_phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            user_email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            user_date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)).required(),
            user_cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            user_province: Joi.string().required(),
            user_district: Joi.string().required(),
            user_town: Joi.string().required(),
            user_detail_address: Joi.string().required(),
            user_bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            user_bank: Joi.string(),

            // Business information
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            business_name: Joi.string().required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            tax_number: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)), 
            province: Joi.string().required(),
            district: Joi.string().required(),
            town: Joi.string().required(),
            detail_address: Joi.string().required(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)).required(),
            bank: Joi.string().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateApprovingNewBusiness = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingBusinessByBusiness = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().regex(new RegExp(process.env.REGEX_BUSINESS)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingBusinessByAdmin = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().regex(new RegExp(process.env.REGEX_BUSINESS)),
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            username: Joi.string(),
            business_name: Joi.string(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            tax_number: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
            approved: Joi.boolean(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingRepresentorByBusiness = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().regex(new RegExp(process.env.REGEX_BUSINESS)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingRepresentorByAdmin = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            business_id: Joi.string().regex(new RegExp(process.env.REGEX_BUSINESS)),
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)),
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCheckingExistBusiness = (data) => {
        const schema = Joi.object({
            tax_number: Joi.string().regex(new RegExp(process.env.REGEX_TAX_CODE)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateQueryUpdatingBusiness = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().regex(new RegExp(process.env.REGEX_BUSINESS)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateGettingBusinessContract = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().regex(new RegExp(process.env.REGEX_BUSINESS)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdatingBusiness = (data) => {
        const schema = Joi.object({
            business_name: Joi.string(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            debit: Joi.number().min(0), 
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdatingBusinessRepresentor = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)),
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateDeletingBusiness = (data) => {
        const schema = Joi.object({
            business_id: Joi.string().regex(new RegExp(process.env.REGEX_BUSINESS)).required(),
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdateBusinessPassword = (data)=>{
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
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }
}

class VehicleValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCheckingExistVehicle = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    };

    validateFindingVehicleByStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingVehicle = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)),
            transport_partner_id: Joi.string(),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            type: Joi.string(),
            mass: Joi.number().min(0),
        }).unknown(false);


        return schema.validate(data);
    }

    validateGettingOrderIds = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreatingVehicleByAgency = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            type: Joi.string().required(),
            license_plate: Joi.string().regex(new RegExp(process.env.REGEX_LICENSE_PLATE)).required(),
            max_load: Joi.number().min(0).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    };

    validateCreatingVehicleByAdmin = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
            type: Joi.string().required(),
            license_plate: Joi.string().regex(new RegExp(process.env.REGEX_LICENSE_PLATE)).required(),
            max_load: Joi.number().min(0).required(),
        }).strict().messages({
        'any.invalid': `The field "{#label}" with value "{.}" is not valid.`,
        'any.required': `Trường "{#label}" cần thiết.`,
        'any.empty': `The field "{#label}" should not be empty.`,
        'any.unknown': `The field "{#label}" is not allowed.`,
    });
        
        return schema.validate(data);
    };

    validateUpdatingVehicle = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            type: Joi.string(),
            license_plate: Joi.string().regex(new RegExp(process.env.REGEX_LICENSE_PLATE)),
            max_load: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    };

    validateShipmentIds = (data) => {
        const schema = Joi.object({
            shipment_ids: Joi.array().items(Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID))),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateDeletingVehicle = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    };

    validateUndertakeShipment = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class AuthorizationValidation {
    validateUpdatingAuthorization = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            permissions: Joi.array(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateDeletingAuthorization = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            permissions: Joi.array(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingAuthorization = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

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
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateLoginPartnerStaff = (data) => {
        const schema = Joi.object({
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).min(10).max(15).required(),
            password: joiPassword
            .string()
            .min(8)
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(0)
            .noWhiteSpaces()
            .required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCheckingExistPartnerStaff = (data) => {
        const schema = Joi.object({
            username: Joi.string(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.phone_number)),
            bin: Joi.string().regex(new RegExp(process.env.phone_number)),
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreatingPartnerStaff = (data) => {
        const schema = Joi.object({
            partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)).required(),
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
            fullname: Joi.string().required(),
            email: Joi.string().email(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)).required(),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            role: Joi.string().valid("PARTNER_DRIVER", "PARTNER_SHIPPER").required(),
            position: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingPartnerStaffByPartnerStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingPartnerStaffByPartner = (data) => {
        const schema = Joi.object({
            partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            username: Joi.string(),
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            position: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingPartnerStaffByAdmin = (data) => {
        const schema = Joi.object({
            partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)),
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            username: Joi.string(),
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            cccd: Joi.string().regex(new RegExp(process.env.REGEX_CCCD)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            position: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdatingPartnerStaff = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().lowercase().regex(new RegExp(process.env.REGEX_NAME)),
            username: Joi.string(),
            date_of_birth: Joi.string().regex(new RegExp(process.env.REGEX_BIRTHDAY)), 
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            province: Joi.string(),
            district: Joi.string(),
            town: Joi.string(),
            detail_address: Joi.string(),
            position: Joi.string(),
            bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            bank: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateDeletingPartnerStaff = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

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
            .minOfNumeric(1)
            .noWhiteSpaces()
            .required(),
            confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }
}

class TransportPartnerValidation {
    
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreatingPartnerByAdmin = (data) => {
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
            user_bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            user_bank: Joi.string(),

            // Transport partner information
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)).required(),
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
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    };

    validateCreatingPartnerByAgency = (data) => {
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
            user_bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
            user_bank: Joi.string(),

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
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    };

    validateFindingPartnerByPartner = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingPartnerByAdmin = (data) => {
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
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

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
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    };
    
    validateGettingContract = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateDeletingPartner = (data) => {
        const schema = Joi.object({
            transport_partner_id: Joi.string().regex(new RegExp(process.env.REGEX_TRANSPORT_PARTNER)).required(),
        });
        return schema.validate(data);
    };
}

class AgencyValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCheckingExistAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }

    validateCreatingAgency = (data) => {
        const schema = Joi.object({
            // Head officer information
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
            type: Joi.string().valid("BC", "DL", "TD"),
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

            individual_company: Joi.boolean().required(),
            company_name: Joi.string(),
            tax_number: Joi.string(),
            }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
            return schema.validate(data);
        };

        validateCreatingAgencyCompany = (data) => {
            const schema = Joi.object({
                company_name: Joi.string().required(),
                tax_number: Joi.string().required(),
            }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

            return schema.validate(data); 
        };

        validateFindingAgencyByAgency = (data) => {
            const schema = Joi.object({
                agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
            }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

            return schema.validate(data);
        }

        validateFindingAgencyByAdmin = (data) => {
            const schema = Joi.object({
                agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)),
                agency_name: Joi.string(),
                level: Joi.number().min(1).max(5),
                province: Joi.string(),
                district: Joi.string(),
                town: Joi.string(),
                phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
                email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),  
                bin: Joi.string().regex(new RegExp(process.env.REGEX_BIN)),
                bank: Joi.string(),
            }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

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
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdateAgencyCompany = (data) => {
        const schema = Joi.object({
          company_name: Joi.string(),
          tax_number: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
    
        return schema.validate(data);
    };

    validateDeletingAgency = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateQueryUpdatingLicenseImages = (data) => {
        const schema = Joi.object({
            agency_id: Joi.string().regex(new RegExp(process.env.REGEX_AGENCY_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class OTPValidation {
    validateSendingOTP = (data) => {
        const schema = Joi.object({
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateVerifyOTP = (data) => {
        const schema = Joi.object({
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            otp: Joi.string().regex(new RegExp(process.env.REGEX_OTP)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class UserValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCreatingUser = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)).required(),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)).required(),
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
    
    validateCheckingExistUser = (data) => {
        const schema = Joi.object({
            phone_number: Joi.string().regex(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }

    validateUpdatingUser = (data) => {
        const schema = Joi.object({
            fullname: Joi.string().regex(new RegExp(process.env.REGEX_NAME)),
            email: Joi.string().regex(new RegExp(process.env.REGEX_EMAIL)),
            address: Joi.string()
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class OrderValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingOrders = (data) => {
        const schema = Joi.object({
            order_id: Joi.string().regex(new RegExp(process.env.REGEX_ORDER_ID)),
            name_receiver: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)),
            phone_receiver: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)),
            province_source:Joi.string(),
            district_source:Joi.string(),
            ward_source:Joi.string(),
            province_dest: Joi.string(),
            district_dest: Joi.string(),
            ward_dest: Joi.string(),
            service_type: Joi.number().valid(1, 2, 3, 4 ,5)
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    }

    validateCreatingOrder = (data) => {
        const schema = Joi.object({  
            name_sender: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)).required(),
            name_receiver: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)).required(),
            phone_number_receiver: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            mass: Joi.number().precision(2).min(0).required(),
            height: Joi.number().precision(2).min(0).required(),
            width: Joi.number().precision(2).min(0).required(),
            length: Joi.number().precision(2).min(0).required(),
            province_source:Joi.string().required(),
            district_source:Joi.string().required(),
            ward_source:Joi.string().required(),
            detail_source: Joi.string().required(),
            province_dest: Joi.string().required(),
            district_dest: Joi.string().required(),
            ward_dest:Joi.string().required(),
            detail_dest: Joi.string().required(),
            long_source: Joi.number().min(-180).max(180).required(),
            lat_source: Joi.number().min(-90).max(90).required(),
            long_destination: Joi.number().min(-180).max(180).required(),
            lat_destination: Joi.number().min(-90).max(90).required(),
            COD: Joi.number().min(0),
            service_type: Joi.string().valid("CPN", "T60", "TTK", "HHT").required(),
        }).strict()
        .messages({
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "any.required": `Trường {#label} là bắt buộc.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    }

    validateCreatingOrderByAdmin = (data) => {
        const schema = Joi.object({
            STT: Joi.number().min(0),
            name_sender: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)).required(),
            phone_number_sender: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            name_receiver: Joi.string().pattern(new RegExp(process.env.REGEX_NAME)).required(),
            phone_number_receiver: Joi.string().pattern(new RegExp(process.env.REGEX_PHONE_NUMBER)).required(),
            mass: Joi.number().precision(2).min(0),
            height: Joi.number().precision(2).min(0),
            width: Joi.number().precision(2).min(0),
            length: Joi.number().precision(2).min(0),
            province_source: Joi.string().required(),
            district_source: Joi.string().required(),
            ward_source: Joi.string().required(),
            detail_source: Joi.string().required(),
            province_dest: Joi.string().required(),
            district_dest: Joi.string().required(),
            ward_dest: Joi.string().required(),
            detail_dest: Joi.string().required(),
            long_source: Joi.number().min(-180).max(180),
            lat_source: Joi.number().min(-90).max(90),
            long_destination: Joi.number().min(-180).max(180),
            lat_destination: Joi.number().min(-90).max(90),
            COD: Joi.number().min(0),
            service_type: Joi.string().valid("CPN", "T60", "TTK", "HHT").required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        
        return schema.validate(data);
    }

    validateQueryUpdatingOrder = (data) => {
        const schema = Joi.object({
            order_id: Joi.string().regex(new RegExp(process.env.REGEX_ORDER_ID)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdatingOrder = (data) => {
        const schema = Joi.object({
            mass: Joi.number().precision(2).min(0),
            height: Joi.number().precision(2).min(0),
            width: Joi.number().precision(2).min(0),
            length: Joi.number().precision(2).min(0),
            COD: Joi.number().precision(3).min(0),
            status_code: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
    
        return schema.validate(data);
    }

    validateCancelingOrder = (data) => {
        const schema = Joi.object({
            order_id: Joi.string().regex(new RegExp(process.env.REGEX_ORDER_ID)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateCalculatingFee = (data) => {
        const schema = Joi.object({
            province_source: Joi.string().required(),
            district_source: Joi.string().required(),
            ward_source: Joi.string().required(),
            detail_source: Joi.string().required(),
            province_dest: Joi.string(),
            district_dest: Joi.string(),
            ward_dest: Joi.string(),
            detail_dest: Joi.string(),
            service_type: Joi.string().valid("CPN", "T60", "TTK", "HTT"),
            length: Joi.number().min(0),
            width: Joi.number().min(0),
            height: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateQueryUpdatingOrderImages = (data) => {
        const schema = Joi.object({
            order_id: Joi.string().regex(new RegExp(process.env.REGEX_ORDER_ID)).required(),
            type: Joi.string().valid("send", "receive").required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class ShippersValidation {
    validatePaginationConditions = (data) => {
        const schema = Joi.object({
            rows: Joi.number().min(0),
            page: Joi.number().min(0),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
    
    validateCreatingNewTask = (data) => {
        const schema = Joi.object({
            shipment_id: Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID)).required(),
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingTasks = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            option: Joi.number().valid(0, 1, 2).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateConfirmingCompletedTasks = (data) => {
        const schema = Joi.object({
            id: Joi.number().min(0).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateGettingHistory = (data) => {
        const schema = Joi.object({
            option: Joi.number().valid(0, 1, 2, 3).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class DriversValidation {
    validateCreatingNewTask = (data) => {
        const schema = Joi.object({
            shipment_ids: Joi.array().items(Joi.string().regex(new RegExp(process.env.REGEX_SHIPMENT_ID))).required(),
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateFindingTasks = (data) => {
        const schema = Joi.object({
            staff_id: Joi.string().regex(new RegExp(process.env.REGEX_PERSONNEL)),
            option: Joi.number().valid(0, 1, 2, 3).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateConfirmingCompletedTasks = (data) => {
        const schema = Joi.object({
            id: Joi.number().min(0).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class ScheduleValidation {
    validateCreateSchedule = (data) => {
        const schema = Joi.object({
            task: Joi.string().required(),
            priority: Joi.number().min(1).max(5).required(),
            deadline: Joi.date().greater("now").required(),
        }).unknown(false);
        return schema.validate(data);
    };

    validateFindingSchedule = (data) => {
        const schema = Joi.object({
            task: Joi.string(),
            priority: Joi.number().min(1).max(5),
            completed: Joi.boolean(),
            deadline: Joi.date(),
        });
        return schema.validate(data);
    };

    validateUpdatingSchedule = (data) => {
        const schema = Joi.object({
            task: Joi.string(),
            priority: Joi.number().min(1).max(5),
            completed: Joi.boolean(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    };

    validateIDSchedule = (data) => {
        const schema = Joi.object({
            id: Joi.number().required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    };
}

class AdministrativeUnit {
    validateGettingUnit = (data) => {
        const schema = Joi.object({
            province: Joi.string(),
            district: Joi.string(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });
        return schema.validate(data);
    }
}

class RouteValidation {
    validateCreatingNewRoute = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)).required(),
            source: Joi.string().required(),
            destination: Joi.string().required(),
            departure_time: Joi.string().regex(new RegExp(process.env.REGEX_TIME)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateGettingRoute = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)),
            source: Joi.string(),
            destination: Joi.string(),
            from_departure_time: Joi.string().regex(new RegExp(process.env.REGEX_TIME)),
            to_departure_time: Joi.string().regex(new RegExp(process.env.REGEX_TIME)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateUpdatingRoute = (data) => {
        const schema = Joi.object({
            vehicle_id: Joi.string().regex(new RegExp(process.env.REGEX_VEHICLE)),
            source: Joi.string(),
            destination: Joi.string(),
            departure_time: Joi.string().regex(new RegExp(process.env.REGEX_TIME)),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }

    validateRouteId = (data) => {
        const schema = Joi.object({
            id: Joi.number().min(0).required(),
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });

        return schema.validate(data);
    }
}

class PaymentValidation {
    validatePaymentResult = (data) => {
        const schema = Joi.object({
            code: Joi.string().alphanum().length(2).required(),
            desc: Joi.string().required(),
            data: {
                id: Joi.string().alphanum().required(),
                orderCode: Joi.string().regex(new RegExp(process.env.REGEX_ORDER_ID)).required(),
                amount: Joi.number().min(0).required(),
                amountPaid: Joi.number().min(0).required(),
                amountRemaining: Joi.number().min(0).required(),
                status: Joi.string().required(),
                createdAt: Joi.string().regex(new RegExp(process.env.REGEX_DATE_ISO)).required(),
                transactions: Joi.array().required(),
                cancellationReason: Joi.string().allow(null).required(),
                canceledAt: Joi.string().regex(new RegExp(process.env.REGEX_DATE_ISO)).allow(null).required(),
            },
            signature: Joi.string().alphanum().required()
        }).strict()
        .messages({
            "any.required": `Trường {#label} là bắt buộc.`,
            "any.invalid": `Trường {#label} với giá trị {.} không hợp lệ.`,
            "any.empty": `Trường {#label} không được để trống.`,
            "string.pattern.base": `Trường {#label} với giá trị {:[.]} không hợp lệ.`,
            "string.alphanum": `Trường {#label} chỉ có thể chứa chữ cái và số.`,
            "string.email": `Trường {#label} phải là một địa chỉ email hợp lệ.`,
            "object.unknown": `Trường {#label} không được cho phép.`,
            "number.min": `Trường {#label} phải lớn hơn hoặc bằng {#limit}.`,
            "number.max": `Trường {#label} phải nhỏ hơn hoặc bằng {#limit}.`,
            "string.min": `Trường {#label} phải có ít nhất {#limit} ký tự.`,
            "string.max": `Trường {#label} không được vượt quá {#limit} ký tự.`,
            "number.base": `Trường {#label} phải là một số.`,
            "any.only": `Trường {#label} phải là một trong các giá trị sau: {#valids}.`,
        });;

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
    OTPValidation,
    UserValidation,
    OrderValidation,
    ShippersValidation,
    DriversValidation,
    ScheduleValidation,
    AdministrativeUnit,
    RouteValidation,
    PaymentValidation,
}
