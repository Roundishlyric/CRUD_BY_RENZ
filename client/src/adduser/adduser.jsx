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
    birthday: "",
    contactNumber: "",
  });

  const navigate = useNavigate();
  const API_BASE = "http://localhost:8000";

  // Prevent Bearer undefined/null
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

    // enforce numbers only for contactNumber
    if (name === "contactNumber") {
      const onlyDigits = value.replace(/\D/g, "");
      setUser((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const submitform = async (e) => {
    e.preventDefault();

    //  Frontend validation
    if (!user.name || !user.email || !user.address || !user.birthday || !user.contactNumber) {
      toast.error("Please fill out all fields before submitting.", {
        position: "top-right",
      });
      return;
    }

    if (!user.email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }

    // numbers only check (extra safety)
    if (!/^[0-9]+$/.test(user.contactNumber)) {
      toast.error("Contact number must contain numbers only.", { position: "top-right" });
      return;
    }

    // length check (match your model 7-15)
    if (user.contactNumber.length < 7 || user.contactNumber.length > 15) {
      toast.error("Contact number must be 7 to 15 digits.", { position: "top-right" });
      return;
    }

    const confirmCreate = window.confirm(
      "Are you sure you want to create this user?"
    );
    if (!confirmCreate) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      const response = await axios.post(`${API_BASE}/api/user/register`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

      console.log("ADD USER STATUS:", status);
      console.log("ADD USER RESPONSE:", error.response?.data);

      if ([401, 403].includes(status)) {
        toast.error("Unauthorized. Please log in again.", {
          position: "top-right",
        });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

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

        {/*  Birthday */}
        <div className="input">
          <label htmlFor="birthday">Birthday:</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={user.birthday}
            onChange={inputhandler}
          />
        </div>

        {/*  Contact Number */}
        <div className="input">
          <label htmlFor="contactNumber">Contact Number:</label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={user.contactNumber}
            onChange={inputhandler}
            autoComplete="off"
            placeholder="Enter contact number"
            inputMode="numeric"
            pattern="[0-9]*"
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
