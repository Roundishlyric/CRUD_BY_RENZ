import React, { useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    if (!email.includes("@")) {
      toast.error("Invalid email format", { position: "top-right" });
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/user/login", {
        email,
        password,
      });

      const data = res.data;

      // robust token extraction (supports accessToken or token)
      const token = data.accessToken || data.token;

      if (!token) {
        toast.error("Login succeeded but no token was returned.", {
          position: "top-right",
        });
        return;
      }

      // SAVE SESSION
      localStorage.setItem("user", JSON.stringify(data.result));
      localStorage.setItem("token", token);

      toast.success(data.message || "Login successful", { position: "top-right" });
      navigate("/user");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="authPage">
      <div className="authCard">
        {/* LEFT PANEL */}
        <div className="authImage">
          <div className="imageOverlay">
            <h1 className="imageHeadline">Welcome</h1>
            <p className="imageSub">User Management System by Renz Rapanut</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="authForm">
          <div className="authTabs">
            <span className="tab active">Sign In</span>
            <Link to="/register" className="tab">
              Sign Up
            </Link>
          </div>

          <h2 className="authTitle">Sign In</h2>

          <form onSubmit={handleSubmit} className="authFormInner">
            <input
              type="text"
              placeholder="Enter your Email"
              className="authInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter your Password"
              className="authInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" className="primaryBtn">
              SIGN IN
            </button>

            <div className="divider">OR</div>

            <Link to="/register" className="secondaryBtn">
              SIGN UP
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
