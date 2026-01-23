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

    // validation
    if (!email || !password) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/user/login", {
        email,
        password,
      });

      // Your backend returns: result + accessToken
      localStorage.setItem("user", JSON.stringify(response.data.result));
      localStorage.setItem("token", response.data.accessToken);

      toast.success(response.data.message || "Login successful", {
        position: "top-right",
      });

      navigate("/user");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Email/Password", {
        position: "top-right",
      });
    }
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
            value={email}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-danger btn-lg w-100 mt-3">
          Login
        </button>
      </form>

      <p>Don't Have Account?</p>

      <Link
        to="/register"
        type="button"
        className="btn btn-secondary btn-lg w-100 mt-3"
      >
        Register
      </Link>
    </div>
  );
}

export default Login;
