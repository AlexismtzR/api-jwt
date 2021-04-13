const mongoose = require('mongoose');

const movimientos = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cuentaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cuenta",
        required: true,
    },
    finicio: {
        type: Date,
    },
    ffin: {
        type: Date,
    },
    motivo: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    nombreusr: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    cname: {
        type: String,
        required: true,
        min: 6,
        max: 255        
    }

})

module.exports = mongoose.model('Movimiento', movimientos);