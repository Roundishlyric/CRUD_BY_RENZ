import User from "../model/userModel.js";
import regis from "../model/logmodel.js";
import AuditLog from "../model/auditLogModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const writeAudit = async ({ model, recordId, action, req, before, after }) => {
  try {
    await AuditLog.create({
      model,
      recordId,
      action,
      actorId: req.user?.id || null,
      actorEmail: req.user?.email || null,
      before: before || null,
      after: after || null,
      at: new Date(),
    });
  } catch (e) {
    // Don’t crash the request if logging fails
    console.log("Audit log write failed:", e.message);
  }
};

// REGISTER USER (unchanged)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await regis.findOne({ email });
    if (userExist) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newLog = new regis({ name, email, password: hashedPassword });
    const savedData = await newLog.save();

    const accessToken = jwt.sign(
      { id: savedData._id, email: savedData.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      result: { id: savedData._id, name: savedData.name, email: savedData.email },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN USER (unchanged)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await regis.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      result: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD USER (CREATE) + AUDIT
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

    const existingUser = await User.findOne({ email, isDeleted: false });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists!" });
    }

    const newUser = await User.create({
      name,
      email,
      address,
      birthday: new Date(birthday),
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

    return res.status(200).json({
      success: true,
      message: "User created successfully.",
      result: newUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// SHOW USERS (HIDE DELETED)
// SHOW USERS
export const getallusers = async (req, res) => {
  try {
    // if you implemented soft delete, keep { isDeleted: false }
    // otherwise use User.find()
    const userData = await User.find({ isDeleted: false });

    // DO NOT return 404 when empty
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      result: userData, // [] is OK
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// SPECIFIC ID (ONLY IF NOT DELETED)
export const getuserID = async (req, res) => {
  try {
    const id = req.params.id;

    const userExist = await User.findOne({ _id: id, isDeleted: false });
    if (!userExist) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      result: userExist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE USER + AUDIT
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

    const beforeDoc = await User.findOne({ _id: id, isDeleted: false });
    if (!beforeDoc) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updateddata = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        address,
        birthday: new Date(birthday),
        contactNumber,
      },
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
    return res.status(500).json({ success: false, message: error.message });
  }
};


// DELETE USER (SOFT DELETE) + AUDIT
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const userExist = await User.findOne({ _id: id, isDeleted: false });
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

    res.status(200).json({
      success: true,
      message: "User soft-deleted successfully.",
      result: { id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SYSTEM LOGS (AUDIT TRAILS)
export const getSystemLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ at: -1 }).limit(200);
    res.status(200).json({ success: true, result: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CLEAR SYSTEM LOGS
export const clearSystemLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});

    res.status(200).json({
      success: true,
      message: "System logs cleared successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

