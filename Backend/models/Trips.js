const mongoose = require('mongoose');

const tripsSchema = new mongoose.Schema({
  latitude: String,
  longitude: String,
  timestamp: String,
  ignition: String,
  fileName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
},{
  timestamps: true
});

module.exports = mongoose.model('Trips', tripsSchema);