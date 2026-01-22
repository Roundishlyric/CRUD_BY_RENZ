import mongoose from "mongoose";

// FOR CRUD USERS
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    birthday: {
      type: Date,
      required: true,
    },

    contactNumber: {
      type: String,             
      required: true,
      trim: true,
      match: [/^[0-9]+$/, "Contact number must contain numbers only"],
      minlength: [7, "Contact number must be at least 7 digits"],
      maxlength: [15, "Contact number must be at most 15 digits"],
    },

    // SOFT DELETE FIELDS
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Register",
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

export default mongoose.model("Users", userSchema);
