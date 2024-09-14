const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dids: [
    {
      did: { type: mongoose.Schema.Types.ObjectId, ref: 'DID' },
      price: { type: Number, required: true },
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },  // Expiration time for the order
});

orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });  // MongoDB TTL index to auto-remove expired orders

module.exports = mongoose.model('Order', orderSchema);
