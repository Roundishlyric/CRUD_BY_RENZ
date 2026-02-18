import React, { useState } from "react";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    /* FORM CHECKER */
    if (!name || !email || !password) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!", {
        position: "top-right",
      });
      return;
    }

    /* POST TO BACKEND */
    axios
      .post("http://localhost:8000/api/user/registrar", {
        name,
        email,
        password,
      })
      .then((result) => {
        toast.success(result.data.message, { position: "top-right" });
        navigate("/");
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          toast.error(error.response.data.message, {
            position: "top-right",
          });
        } else {
          toast.error("Registration failed. Please try again.", {
            position: "top-right",
          });
        }
      });
  };

  return (
    <div className="authPage">
      <div className="authCard">

        {/* LEFT PANEL */}
        <div className="authImage">
          <div className="imageOverlay">
            <h1 className="imageHeadline">Register here</h1>
            <p className="imageSub">Create your account</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="authForm">

          <div className="authTabs">
            <Link to="/" className="tab">Sign In</Link>
            <span className="tab active">Sign Up</span>
          </div>

          <h2 className="authTitle">Create Account</h2>

          <form onSubmit={handleSubmit} className="authFormInner">

            <input
              type="text"
              placeholder="Enter your Name"
              className="authInput"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter your Email"
              className="authInput"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter your Password"
              className="authInput"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="primaryBtn">
              SIGN UP
            </button>

            <div className="divider">Already have an account?</div>

            <Link to="/" className="secondaryBtn">
              SIGN IN
            </Link>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
