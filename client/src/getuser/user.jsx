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
    // Load logged-in user
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.log("Invalid JSON in localStorage user:", storedUser);
        localStorage.removeItem("user");
        setCurrentUser(null);
      }
    } else {
      localStorage.removeItem("user");
      setCurrentUser(null);
    }

    // Fetch users list
    const fetchData = async () => {
      try {
        const token = getTokenOrRedirect();
        if (!token) return;

        const response = await axios.get(`${API_BASE}/api/user/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // backend returns { result: [...] }
        setUsers(response.data?.result || []);
      } catch (error) {
        const status = error.response?.status;

        if ([401, 403].includes(status)) {
          toast.error("Unauthorized. Please log in again.", {
            position: "top-right",
          });
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        const message =
          error.response?.data?.message ||
          error.message ||
          "Error while fetching users.";

        toast.error(message, { position: "top-right" });
        console.log("Error while fetching data:", status, error.response?.data || error);
      }
    };

    fetchData();
  }, [navigate]);

  const deleteUser = async (userID) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this user?"
      );
      if (!confirmDelete) return;

      const token = getTokenOrRedirect();
      if (!token) return;

      const response = await axios.delete(
        `${API_BASE}/api/user/delete/user/${userID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers((prev) => prev.filter((u) => u._id !== userID));
      toast.success(response.data?.message || "User deleted.", {
        position: "top-right",
      });
    } catch (error) {
      const status = error.response?.status;

      if ([401, 403].includes(status)) {
        toast.error("Unauthorized. Please log in again.", {
          position: "top-right",
        });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while deleting.";

      toast.error(message, { position: "top-right" });
      console.log("Delete error:", status, error.response?.data || error);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    toast.success("You have logged out successfully!", {
      position: "top-right",
    });
    navigate("/");
  };

  return (
    <div className="userTable">
      {/* Header row: left buttons, centered greeting, right syslogs */}
      <div className="d-flex align-items-center mb-4">
        {/* LEFT */}
        <div>
          <button
            onClick={handleLogout}
            type="button"
            className="btn btn-danger me-2"
          >
            Log Out <i className="fa-solid fa-right-from-bracket"></i>
          </button>

          <Link to="/add" type="button" className="btn btn-danger">
            Add User <i className="fa-solid fa-user-plus"></i>
          </Link>
        </div>

        {/* CENTER */}
        <div className="flex-grow-1 text-center">
          {currentUser?.name && (
            <h1 className="head mb-0">Greetings, {currentUser.name}</h1>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <Link to="/syslogs" type="button" className="btn btn-secondary">
            System Logs
          </Link>
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th scope="col" className="name-panel">
              Serial Number
            </th>
            <th scope="col" className="name-panel">
              Name
            </th>
            <th scope="col" className="name-panel">
              Email
            </th>
            <th scope="col" className="name-panel">
              Address
            </th>
            <th scope="col" className="name-panel">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, index) => (
            <tr key={u._id}>
              <td>{index + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td className="actionbuttons">
                <Link
                  to={`/update/${u._id}`}
                  type="button"
                  className="btn btn-danger"
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                </Link>
                <button
                  onClick={() => deleteUser(u._id)}
                  type="button"
                  className="btn btn-dark ms-2"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default User;
