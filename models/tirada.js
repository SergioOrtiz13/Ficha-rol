const mongoose = require('mongoose');

const tiradaSchema = new mongoose.Schema({
  resultado: [Number],
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('Tirada', tiradaSchema);
