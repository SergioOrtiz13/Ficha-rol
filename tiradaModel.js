const mongoose = require('mongoose');

const tiradaSchema = new mongoose.Schema({
    username: { type: String, required: true },
    resultados: { type: [Number], required: true },
    fecha: { type: Date, default: Date.now }
});

const Tirada = mongoose.model('Tirada', tiradaSchema);

module.exports = Tirada;
