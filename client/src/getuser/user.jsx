import React, { useEffect, useState } from "react";
import "./user.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const User = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8000";

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    const fetchUsers = async () => {
      try {
        const token = getTokenOrRedirect();
        if (!token) return;

        const res = await axios.get(`${API_BASE}/api/user/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(res.data?.result || []);
      } catch (err) {
        toast.error("Failed to fetch users.", { position: "top-right" });
      }
    };

    fetchUsers();
  }, [navigate]);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      await axios.delete(`${API_BASE}/api/user/delete/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted successfully.", { position: "top-right" });
    } catch {
      toast.error("Failed to delete user.", { position: "top-right" });
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
            <div className="userTable">
              <div className="layout">
                {/* LEFT TEXT TABS */}
              <div className="sidebar">

          <Link to="/add" className="tab-link">
            <i className="fa-solid fa-user-plus tab-icon"></i>
            Add User
          </Link>

          <Link to="/syslogs" className="tab-link">
            <i className="fa-solid fa-clipboard-list tab-icon"></i>
            System Logs
          </Link>

          <span onClick={handleLogout} className="tab-link danger">
            <i className="fa-solid fa-right-from-bracket tab-icon"></i>
            Log Out
          </span>

        </div>


        {/* RIGHT CONTENT */}
        <div className="content">
          <h1 className="head">Greetings, {currentUser?.name}</h1>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th className="name-panel">Serial Number</th>
                <th className="name-panel">Name</th>
                <th className="name-panel">Email</th>
                <th className="name-panel">Address</th>
                <th className="name-panel">Birthday</th>
                <th className="name-panel">Contact Number</th>
                <th className="name-panel">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No users found. Click “Add User” to create one.
                  </td>
                </tr>
              ) : (
                users.map((u, index) => (
                  <tr key={u._id}>
                    <td>{index + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.address}</td>
                    <td>{u.birthday ? u.birthday.slice(0, 10) : "-"}</td>
                    <td>{u.contactNumber || "-"}</td>
                    <td className="actionbuttons">
                      <Link to={`/update/${u._id}`} className="action-link edit">
                        <i className="fa-solid fa-pen"></i>
                      </Link>

                      <span
                        onClick={() => deleteUser(u._id)}
                        className="action-link delete"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default User;
