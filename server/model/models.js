import mongoose from "mongoose";

/* REGISTER / ADMIN SCHEMA*/
const registerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

/* USERS SCHEMA (SOFT DELETE + EMAIL REUSE)*/
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // no unique:true here (handled by partial index below)
    },

    address: { type: String, required: true, trim: true },
    birthday: { type: Date, required: true },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]+$/, "Contact number must contain numbers only"],
      minlength: [7, "Contact number must be at least 7 digits"],
      maxlength: [15, "Contact number must be at most 15 digits"],
    },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Register", default: null },
  },
  { timestamps: true }
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

/*AUDIT LOG SCHEMA*/
const auditLogSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, required: true },

    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true,
    },

    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "Register", default: null },
    actorEmail: { type: String, default: null },

    before: { type: Object, default: null },
    after: { type: Object, default: null },

    at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/* MODEL EXPORTS (SAFE REUSE)*/
export const Register =
  mongoose.models.Register || mongoose.model("Register", registerSchema);

export const Users =
  mongoose.models.Users || mongoose.model("Users", userSchema);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

/*MODEL MAP (FOR DYNAMIC CRUD)*/
export const MODEL_MAP = {
  Users,
  Register,
  AuditLog,
};
