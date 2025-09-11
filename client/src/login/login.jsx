import React, { useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // validation
    if (!email || !password) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }

    // login request
    axios
      .post("http://localhost:8000/api/user/login", { email, password })
      .then((result) => {
        console.log(result);

        // Save logged-in user & token
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("token", result.data.accessToken);

        toast.success(result.data.message, { position: "top-right" });
        navigate("/user"); 
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Invalid Email/Password",
          { position: "top-right" }
        );
      });
  };

  return (
    <div className="login">
      <h2>SPACEPORT</h2>
      <h2>LOGIN</h2>
      <form onSubmit={handleSubmit} className="logform">
        <div className="input">
          <label htmlFor="email">
            <strong>Email:</strong>
          </label>
          <input
            type="text"
            name="email"
            autoComplete="off"
            placeholder="Enter your Email"
            className="form control"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input">
          <label htmlFor="password">
            <strong>Password</strong>
          </label>
          <input
            type="password"
            name="password"
            autoComplete="off"
            placeholder="Enter your Password"
            className="form control"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-danger btn-lg w-100 mt-3"
        >
          Login
        </button>
      </form>
      <p1>Don't Have Account? </p1>
      <Link
        to="/register"
        type="login"
        className="btn btn-secondary btn-lg w-100 mt-3"
      >
        Register
      </Link>
    </div>
  );
}

export default Login;
