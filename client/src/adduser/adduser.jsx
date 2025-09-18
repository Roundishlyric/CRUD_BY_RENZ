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

  const inputhandler = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

const submitform = async (e) => {
  e.preventDefault();

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

// confirmation
    const confirmCreate = window.confirm("Are you sure you want to create this user?");
    if (!confirmCreate) return;

  try {
    const token = localStorage.getItem("token"); //  token from storage

    const response = await axios.post(
      "http://localhost:8000/api/user/register",
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`, // send token
        },
      }
    );

    toast.success(response.data.message, { position: "top-right" });
    navigate("/user");
  } catch (error) {
    if (error.response && error.response.status === 400) {
      toast.error(error.response.data.message, { position: "top-right" });
    } else if (error.response && error.response.status === 403) {
      toast.error("Unauthorized. Please log in again.", {
        position: "top-right",
      });
      navigate("/"); // redirect to login
    } else {
      toast.error("Something went wrong. Try again.", {
        position: "top-right",
      });
    }
  }
};

  //FORM DESIGN
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
