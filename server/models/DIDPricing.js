const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null for global pricing
  },
  nonBulkPrice: {
    type: Number,
    required: true, // Price for non-bulk DIDs
  },
  bulkPrice: {
    type: Number,
    required: true, // Price for bulk DIDs
  },
  bulkThreshold: {
    type: Number,
    default: 10, // Number of DIDs required for bulk pricing
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("Pricing", pricingSchema);
