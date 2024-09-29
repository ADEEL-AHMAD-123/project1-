const mongoose = require("mongoose");

const didSchema = new mongoose.Schema({
  didNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Validate if didNumber is exactly 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit DID number!`
    }
  },
  country: { type: String, required: true },
  state: { type: String, required: true },
  areaCode: { type: String, required: true },
  destination: { type: String, required: false },
  status: {
    type: String,
    enum: ["available", "reserved", "purchased", "scheduled_deletion"],
    default: "available",
  },
  callerIdUsage: { type: Boolean, default: false },
  deleteAfterDays: { type: Number, default: null },
  deleteScheduledDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Indexing for better performance on search
didSchema.index({ country: 1, state: 1, areaCode: 1, status: 1 });

module.exports = mongoose.model("DID", didSchema);
