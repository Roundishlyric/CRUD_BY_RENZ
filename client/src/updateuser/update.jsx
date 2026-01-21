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
  const API_BASE = "http://localhost:8000";

  const getTokenOrRedirect = () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      toast.error("Session expired. Please log in again.", { position: "top-right" });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      return null;
    }
    return token;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getTokenOrRedirect();
        if (!token) return;

        const res = await axios.get(`${API_BASE}/api/user/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ your backend returns { result: user }
        setUser(res.data?.result || { name: "", email: "", address: "" });
      } catch (err) {
        const status = err.response?.status;

        if ([401, 403].includes(status)) {
          toast.error("Unauthorized. Please log in again.", { position: "top-right" });
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        console.log("FETCH USER ERROR:", err.response?.data || err);
        toast.error("Failed to load user data", { position: "top-right" });
      }
    };

    fetchUser();
  }, [id, navigate]);

  const inputhandler = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const submitform = async (e) => {
    e.preventDefault();

    if (!user.name || !user.email || !user.address) {
      toast.error("Please fill out all fields before submitting.", { position: "top-right" });
      return;
    }

    if (!user.email.includes("@")) {
      toast.error("Email must include '@'", { position: "top-right" });
      return;
    }

    const confirmUpdate = window.confirm("Are you sure you want to update this user?");
    if (!confirmUpdate) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      const response = await axios.put(
        `${API_BASE}/api/user/update/user/${id}`,
        {
          name: user.name,
          email: user.email,
          address: user.address,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data?.message || "User updated successfully.", {
        position: "top-right",
      });
      navigate("/user");
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || "Something went wrong. Try again.";

      if ([401, 403].includes(status)) {
        toast.error("Unauthorized. Please log in again.", { position: "top-right" });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      toast.error(message, { position: "top-right" });
      console.log("UPDATE ERROR:", error.response?.data || error);
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
