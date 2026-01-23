import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  model: { type: String, required: true }, // e.g., "Users"
  recordId: { type: mongoose.Schema.Types.ObjectId, required: true },

  action: { type: String, enum: ["CREATE", "UPDATE", "DELETE"], required: true },

  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "Register", default: null },
  actorEmail: { type: String, default: null },

  before: { type: Object, default: null },
  after: { type: Object, default: null },

  at: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", auditLogSchema);
