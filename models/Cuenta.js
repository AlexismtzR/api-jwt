const mongoose = require('mongoose');

const cuentaSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    cname: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    opname: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    members: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        finicio: {
            type: Date,
        },
        ffin: {
            type: Date,
        },
        name: {
            type: String,
            required: true,
            min: 6,
            max: 255
        },
        
    }]
    
})

module.exports = mongoose.model('Cuenta', cuentaSchema);