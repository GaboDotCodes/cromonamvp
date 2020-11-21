const { Schema, model } = require('mongoose');
const { isMobilePhone } = require('validator');

const validatePhone = (detail) => isMobilePhone(detail, ['es-CO']),

const urlSchema = new Schema({
    phoneNumber: {
        type: String,
        validate: validatePhone,
    },
    codeInfo:{
        code: {
            type: String
        },
        generatedAt: {
            type: Date,
        }
    },
    location: {
        lat: {
            type: Number,
            required: true,
        },
        lon:{
            type: Number,
            required: true,
        },
        required: true,
    }
});

module.exports = model('User', urlSchema);