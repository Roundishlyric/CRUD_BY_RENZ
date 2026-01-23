import React, { useState } from "react";
import "./signup.css"
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Signup(){
    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
    e.preventDefault()


  //FORM CHECKER
    if (!name || !email || !password) {
    toast.error("All fields are required!", { position: "top-right" });
    return;
  }

    if (!email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }
    
    if (password.length < 6) {
    toast.error("Password must be at least 6 characters long!", { position: "top-right" });
    return;
  }
  

  //POST IN BACKEND
      axios.post('http://localhost:8000/api/user/registrar',{name, email, password})
      .then(result => {console.log(result)

        toast.success(result.data.message,{position:"top-right"})
        navigate('/')
      })
    .catch((error) => {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message, { position: "top-right" });
      } else {
        toast.error("Registration failed. Please try again.", { position: "top-right" });
      }
    });
    }

  return (
    <div className='login'>
      <h2>Register here</h2>
        <form onSubmit={handleSubmit} className="logform">
            <div className='input'>
                <label htmlFor='email'>
                    <strong>Name:</strong>
                </label>
                <input 
                    type='text' 
                    name='name' 
                    autoComplete='off' 
                    placeholder='Enter your Name'
                    className="form control"
                    onChange={(e)=>setName(e.target.value)}
                />
            </div>
            <div className='input'>
                <label htmlFor='email'>
                    <strong>Email:</strong>
                </label>
                <input 
                    type='text' 
                    name='email' 
                    autoComplete='off' 
                    placeholder='Enter your Email'
                    className="form control"
                    onChange={(e)=>setEmail(e.target.value)}
                />
            </div>
            <div className='input'>
                <label htmlFor='email'>
                    <strong>Password</strong>
                </label>
                <input 
                    type='password' 
                    name='password' 
                    autoComplete='off' 
                    placeholder='Enter your Password'
                    className="form control"
                    onChange={(e)=>setPassword(e.target.value)}
                />
            </div>
          <button type="submit" className="btn btn-danger btn-lg w-100 mt-3">Register</button>
          </form>
          <p1>Already have an Account </p1>
          <Link to ='/' type="login" className="btn btn-secondary btn-lg w-100 mt-3">Login</Link>
    </div>
  );
}



export default Signup;
