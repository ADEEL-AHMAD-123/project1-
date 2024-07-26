const mongoose = require('mongoose');
const { Schema } = mongoose;

const vendorSchema = new Schema({
  providerName: { type: String, required: true },
  providerId: { type: String, required: true, unique: true },
  apiEndpointUrl: { type: String, required: true },
  website: { type: String },
  startDate: { type: Date, default: Date.now },
  status: {
    type: String,
    default: 'active',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vendor', vendorSchema);
