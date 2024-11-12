const mongoose = require('mongoose');

const inBoundUsageSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  id_user: { type: Number, required: true },
  day: { type: String, required: true },
  sessiontime: { type: Number, required: true },
  aloc_all_calls: { type: Number, required: true },
  nbcall: { type: Number, required: true },
  nbcall_fail: { type: Number, required: true },
  buycost: { type: Number, required: true },
  sessionbill: { type: Number, required: true },
  lucro: { type: Number, required: true },
  isAgent: { type: Number, required: true },
  agent_bill: { type: Number, required: true },
  asr: { type: Number, required: true },
  sumsessiontime: { type: Number, default: 0 },
  sumsessionbill: { type: Number, default: 0 },
  sumagent_bill: { type: Number, default: 0 },
  sumbuycost: { type: Number, default: 0 },
  sumlucro: { type: Number, default: 0 },
  sumaloc_all_calls: { type: Number, default: 0 },
  sumnbcall: { type: Number, default: 0 },
  idUserusername: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('InBoundUsage', inBoundUsageSchema);
 