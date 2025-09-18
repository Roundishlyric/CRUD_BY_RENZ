import User from "../model/userModel.js";
import regis from "../model/logmodel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

// REGISTER USER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const userExist = await regis.findOne({ email });
    if (userExist) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists." });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required." });
    }

    // hash the password before saving
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

// LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await regis.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials." });
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
    res.status(500).json({ 
      success: false, 
      message: error.message });
  }
};

// ADD USER
export const create = async (req, res) => {
  try {
    const newUser = new User(req.body);
    const { email } = newUser;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already exists!" });
    }

    const savedData = await newUser.save();
    res.status(200).json({
        success: true,
        message: "User created successfully.",
        result: savedData,
    });
  } catch (error) {
    res.status(500).json({ 
        success: false, 
        message: error.message });
  }
};

// SHOW USERS
export const getallusers = async (req, res) => {
  try {
    const userData = await User.find();
    if (!userData || userData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User data not found." });
    }
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      result: userData,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message });
  }
};

// SPECIFIC ID
export const getuserID = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found." });
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      result: userExist,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message });
  }
};

// UPDATE USER
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found." });
    }
    const updateddata = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      result: updateddata,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userExist = await User.findById(id);
    if (!userExist) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found." });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      result: { id },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message });
  }
};
