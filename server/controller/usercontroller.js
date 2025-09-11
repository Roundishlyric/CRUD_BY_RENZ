import User from "../model/userModel.js";
import regis from "../model/logmodel.js"
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config()

// REGISTER USER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const userExist = await regis.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists." });
    }

    //if the fields are empty
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // create new user
    const newLog = new regis({ name, email, password });
    const savedData = await newLog.save();

    // generate access token
    const accessToken = jwt.sign(
      { id: savedData._id, email: savedData.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: savedData,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ errorMessage:error.message })
  }
};

// LOGIN USER 
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user by email
    const user = await regis.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // check password ( in production use bcrypt instead of plain text)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // generate access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

// ADD USER
export const create = async(req, res) =>{
    try{
        const newUser= new User (req.body);
        const {email} = newUser;
        
        const existingUser = await User.findOne({ email });
            if (existingUser) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        const userExist = await User.findOne({email})
        if (userExist){
            return res.status(400).json({message: "User already exist. "});
        }
        const savedData = await newUser.save();
        res.status(200).json({message: "User created successfully. "})
    }catch(error){
        res.status(500).json({errorMessage:error.message})
    }
};

// SHOW USER
export const getallusers = async(req, res) => {
    try{
        const userData = await User.find();
        if(!userData || userData.length === 0){
            return res.status(404).json({ message: "User data not found."});
        }
        res.status(200).json(userData);
    }catch (error) {
        res.status(500).json({ errorMessage: error.message });

    }
};

// SPECIFIC ID
export const getuserID = async(req, res)=> {
    try{
        const id = req.params.id;
        const userExist = await User.findById(id);
        if(!userExist){
            return res.status(404).json({ message: "User not found."});
        }
        res.status(200).json(userExist);
    }catch(error){
        res.status(500).json({ errorMessage: error.message });
    }
}

// UPDATE THE USER
export const update = async(req, res)=> {
    try{
        const id = req.params.id;
        const userExist = await User.findById(id);
        if(!userExist){
            return res.status(404).json({ message: "User not found."});
        }
        const updateddata = await User.findByIdAndUpdate(id, req.body, {
            new:true 
        })
        res.status(200).json({message: "User updated successfully. "})
    }catch(error){
        res.status(500).json({ errorMessage: error.message });
    }
}

// DELETE USER
export const deleteUser = async (req, res) => {
    try{
        const id = req.params.id;
        const userExist = await User.findById(id);
        if(!userExist){
            return res.status(404).json({ message: "User not found."});
        }
        await User.findByIdAndDelete(id);
        res.status(200).json({message: "User deleted successfully. "})
    }catch(error){
        res.status(500).json({ errorMessage: error.message });
    }
}