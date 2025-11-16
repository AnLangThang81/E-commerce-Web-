const Joi = require("joi");

const brandSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên danh mục không được để trống",
    "any.required": "Tên danh mục là trường bắt buộc",
  }),
  description: Joi.string().allow("").optional(),
  isActive: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().default(0),
});

module.exports={
    brandSchema,
}