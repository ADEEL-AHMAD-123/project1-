const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  individualPrice: {
    type: Number,
    required: true, // Price for buying a single DID
  },
  bulkPrice: {
    type: Number,
    required: true, // Price for buying DIDs in bulk
  },
  lastModified: {
    type: Date,
    default: Date.now, // Automatically set the date when the pricing is created or updated
  }
});

module.exports = mongoose.model("Pricing", pricingSchema);
