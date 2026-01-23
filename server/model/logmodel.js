 import mongoose from "mongoose"

 //FOR REGISTRATION
 const employSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
 })

 export default mongoose.model("Register", employSchema);