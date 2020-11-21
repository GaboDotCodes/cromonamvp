const { Schema, model } = require('mongoose');
const { isMobilePhone } = require('validator');

const urlSchema = new Schema({
    phoneNumber: {
        type: String,
        validate: isMobilePhone(detail, ['es-CO']),
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