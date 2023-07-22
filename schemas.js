const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHtml': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHtml: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHtml', { value })
                return clean;
            }
        }
    }
})

const Joi = BaseJoi.extend(extension); //joi now equals the old version of joi with the new extension

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHtml(),
        //image: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().required().escapeHtml(),
        location: Joi.string().required().escapeHtml()
    }).required() ,
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHtml(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
});