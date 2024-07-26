const mongoose = require("mongoose");
const { Schema } = mongoose;

const serverSchema = new Schema({
  // Existing fields...
  serverName: { type: String },
  dialerSpecifications: {
    cpu: { type: String },
    ram: { type: String },
    diskSpace: { type: String },
    usage: { type: String },
  },
  price: {
    buyPriceMonthly: { type: Number },
    sellPriceMonthly: { type: Number },
  },
  dialerLocation: {
    dataCenterName: { type: String },
    city: { type: String },
    country: { type: String },
    networkZone: { type: String },
  },
  agentCredentials: {
    numberOfAgents: { type: Number, required: true },
    locationOfAgents: { type: String, required: true },
    agentDialerUrl: { type: String },
    userIdStartRange: { type: Number },
    userIdEndRange: { type: Number },
    userPassword: { type: String },
    phoneIdStartRange: { type: Number },
    phoneIdEndRange: { type: Number },
    phoneIdPassword: { type: String },
    sipIpAddress: { type: String },
    ipPort: { type: Number },
  },
  adminCredentials: {
    adminDialerUrl: { type: String },
    adminUsername: { type: String },
    adminPassword: { type: String },
    monitoringId: { type: String },
    firewallUrl: { type: String },
    firewallUsername: { type: String },
    firewallPassword: { type: String },
  },
  companyUser: {
    _id: { type: Schema.Types.ObjectId },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ['initializing', 'processing', 'created'],
    default: 'initializing',
  },
  createdAt: { type: Date, default: Date.now },
  
  // New field for activities
  activities: [
    {
      action: { type: String },
      timestamp: { type: Date, default: Date.now },
      details: { type: String },
    },
  ],
});

module.exports = mongoose.model("Server", serverSchema);
