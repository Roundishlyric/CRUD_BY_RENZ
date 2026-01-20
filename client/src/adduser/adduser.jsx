import React, { useState } from "react";
import "./adduser.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const AddUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
  });

  const navigate = useNavigate();
  const API_BASE = "http://localhost:8000";

  // ✅ Prevent Bearer undefined/null
  const getTokenOrRedirect = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      toast.error("Session expired. Please log in again.", {
        position: "top-right",
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      return null;
    }
    return token;
  };

  const inputhandler = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const submitform = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    if (!user.name || !user.email || !user.address) {
      toast.error("Please fill out all fields before submitting.", {
        position: "top-right",
      });
      return;
    }

    if (!user.email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }

    const confirmCreate = window.confirm(
      "Are you sure you want to create this user?"
    );
    if (!confirmCreate) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      const response = await axios.post(
        `${API_BASE}/api/user/register`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data?.message || "User created successfully!", {
        position: "top-right",
      });

      navigate("/user");
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Try again.";

      // ✅ Debug logs (safe to keep during dev)
      console.log("ADD USER STATUS:", status);
      console.log("ADD USER RESPONSE:", error.response?.data);

      // ✅ Handle auth failures
      if ([401, 403].includes(status)) {
        toast.error("Unauthorized. Please log in again.", {
          position: "top-right",
        });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      // ✅ Show backend validation errors (400)
      if (status === 400) {
        toast.error(message, { position: "top-right" });
        return;
      }

      toast.error(message, { position: "top-right" });
    }
  };

  return (
    <div className="addUser">
      <Link to="/user" type="button" className="btn btn-secondary">
        <i className="fa-solid fa-backward"></i> Back
      </Link>

      <h3>Add New User</h3>

      <form className="adduserform" onSubmit={submitform}>
        <div className="input">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={user.name}
            onChange={inputhandler}
            autoComplete="off"
            placeholder="Enter your name"
          />
        </div>

        <div className="input">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            id="email"
            name="email"
            value={user.email}
            onChange={inputhandler}
            autoComplete="off"
            placeholder="Enter your email"
          />
        </div>

        <div className="input">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={user.address}
            onChange={inputhandler}
            autoComplete="off"
            placeholder="Enter your address"
          />
        </div>

        <div className="input">
          <button type="submit" className="btn btn-danger">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
