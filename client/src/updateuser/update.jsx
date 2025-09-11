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
        const res = await axios.get(`http://localhost:8000/api/user/users/${id}`);
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

  const submitform = async (e) => {
    e.preventDefault();

    // validation for empty fields
    if (!user.name || !user.email || !user.address) {
      toast.error("Please fill out all fields before submitting.", {
        position: "top-right",
      });
      return;
    }

    // validation for email
    if (!user.email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8000/api/user/update/user/${id}`,
        user
      );
      toast.success(response.data.message, { position: "top-right" });
      navigate("/user");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message, { position: "top-right" });
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
