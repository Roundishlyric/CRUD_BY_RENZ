import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Users, Register, AuditLog } from "../model/models.js";

dotenv.config();

/* AUDIT LOGGER*/
const writeAudit = async ({ model, recordId, action, req, before, after }) => {
  try {
    await AuditLog.create({
      model,
      recordId,
      action,
      actorId: req.user?.id || null,
      actorEmail: req.user?.email || null,
      before: before ?? null,
      after: after ?? null,
      at: new Date(),
    });
  } catch (e) {
    console.log("Audit log write failed:", e.message);
  }
};

/* AUTH (REGISTER ADMIN)*/
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const userExist = await Register.findOne({ email });
    if (userExist) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await Register.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      result: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* AUTH (LOGIN ADMIN)*/
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Register.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const accessToken = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      result: { id: admin._id, name: admin.name, email: admin.email },
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* USERS CRUD (CREATE) */
export const create = async (req, res) => {
  try {
    const { name, email, address, birthday, contactNumber } = req.body;

    if (!name || !email || !address || !birthday || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (including birthday and contact number).",
      });
    }

    if (!/^[0-9]+$/.test(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must contain numbers only.",
      });
    }

    const parsedBirthday = new Date(birthday);
    if (Number.isNaN(parsedBirthday.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid birthday format. Use a valid date (e.g. 2026-02-02).",
      });
    }

    // Treat missing isDeleted as active => blocks duplicates safely
    const existingUser = await Users.findOne({
      email,
      isDeleted: { $ne: true }, // false OR missing
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists!" });
    }

    const newUser = await Users.create({
      name,
      email,
      address,
      birthday: parsedBirthday,
      contactNumber,
    });

    await writeAudit({
      model: "Users",
      recordId: newUser._id,
      action: "CREATE",
      req,
      before: null,
      after: newUser.toObject(),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      result: newUser,
    });
  } catch (error) {
    // Mongo duplicate from partial index (active users)
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists!" });
    }

    // Mongoose validation errors
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

/* USERS CRUD (READ ALL)*/
export const getallusers = async (req, res) => {
  try {
    const userData = await Users.find({ isDeleted: false });
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      result: userData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/*USERS CRUD (READ ONE)*/
export const getuserID = async (req, res) => {
  try {
    const id = req.params.id;

    const userExist = await Users.findOne({ _id: id, isDeleted: false });
    if (!userExist) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      result: userExist,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* USERS CRUD (UPDATE)*/
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, address, birthday, contactNumber } = req.body;

    if (!name || !email || !address || !birthday || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (including birthday and contact number).",
      });
    }

    if (!/^[0-9]+$/.test(contactNumber)) {
      return res.status(400).json({
        success: false,
        message: "Contact number must contain numbers only.",
      });
    }

    const parsedBirthday = new Date(birthday);
    if (Number.isNaN(parsedBirthday.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid birthday format. Use a valid date (e.g. 2026-02-02).",
      });
    }

    const beforeDoc = await Users.findOne({ _id: id, isDeleted: false });
    if (!beforeDoc) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updateddata = await Users.findByIdAndUpdate(
      id,
      { name, email, address, birthday: parsedBirthday, contactNumber },
      { new: true, runValidators: true }
    );

    await writeAudit({
      model: "Users",
      recordId: updateddata._id,
      action: "UPDATE",
      req,
      before: beforeDoc.toObject(),
      after: updateddata.toObject(),
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      result: updateddata,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already exists!" });
    }
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* USERS CRUD (SOFT DELETE)*/
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const userExist = await Users.findOne({ _id: id, isDeleted: false });
    if (!userExist) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const beforeSnapshot = userExist.toObject();

    userExist.isDeleted = true;
    userExist.deletedAt = new Date();
    userExist.deletedBy = req.user?.id || null;
    await userExist.save();

    await writeAudit({
      model: "Users",
      recordId: userExist._id,
      action: "DELETE",
      req,
      before: beforeSnapshot,
      after: userExist.toObject(),
    });

    return res.status(200).json({
      success: true,
      message: "User soft-deleted successfully.",
      result: { id },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* SYSTEM LOGS*/
export const getSystemLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ at: -1 }).limit(200);
    return res.status(200).json({ success: true, result: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearSystemLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    return res.status(200).json({ success: true, message: "System logs cleared successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
