const mongoose = require('mongoose');

// Definimos el esquema para las tiradas
const tiradaSchema = new mongoose.Schema({
    username: { type: String, required: true },
    resultados: { type: [Number], required: true },
    fecha: { type: Date, default: Date.now }
});

// Modelo para la colección 'tiradas'
const Tirada = mongoose.model('Tirada', tiradaSchema);

module.exports = Tirada;
