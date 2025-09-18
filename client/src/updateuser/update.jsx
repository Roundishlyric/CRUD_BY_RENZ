import React, { useState, useEffect } from "react";
import "./update.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const UpdateUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
  });

  const navigate = useNavigate();
  const { id } = useParams();

  // fetch existing user data
useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token"); // get token
      const res = await axios.get(
        `http://localhost:8000/api/user/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // send token
          },
        }
      );
      setUser(res.data);
    } catch (err) {
      toast.error("Failed to load user data", { position: "top-right" });
    }
  };
  fetchUser();
}, [id]);

  const inputhandler = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

// update form submit
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
    const confirmCreate = window.confirm("Are you sure you want to update this user?");
    if (!confirmCreate) return;

  try {
    const token = localStorage.getItem("token"); // ✅ get token
    const response = await axios.put(
      `http://localhost:8000/api/user/update/user/${id}`,
      user,
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ send token
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
      navigate("/");
    } else {
      toast.error("Something went wrong. Try again.", {
        position: "top-right",
      });
    }
  }
};

  return (
    <div className="addUser">
      <Link to="/user" type="button" className="btn btn-secondary">
        <i className="fa-solid fa-backward"></i> Back
      </Link>

      <h3>Update User</h3>

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
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;
