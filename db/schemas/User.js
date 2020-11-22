const { Schema, model } = require('mongoose');
const { isMobilePhone } = require('validator');

const validatePhone = (detail) => isMobilePhone(detail, ['es-CO']);

const userSchema = new Schema({
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
        },
        lon:{
            type: Number,
        },
    }
});

module.exports = model('User', userSchema);