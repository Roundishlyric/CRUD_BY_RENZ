import mongoose from "mongoose";

// FOR CRUD USERS
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, trim: true, lowercase: true },

    address: { type: String, required: true, trim: true },

    // ✅ SOFT DELETE FIELDS
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Register", default: null },
  },
  { timestamps: true } // ✅ adds createdAt, updatedAt
);

export default mongoose.model("Users", userSchema);
