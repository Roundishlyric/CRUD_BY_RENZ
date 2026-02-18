import React, { useEffect, useMemo, useState, useCallback } from "react";
import "./user.css";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import UserForm from "../components/UserForm";
import useConfirm from "../components/useConfirm";

const User = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [modal, setModal] = useState(null); // "add" | "edit" | null
  const [editingId, setEditingId] = useState(null);
  const [editingInitial, setEditingInitial] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const { confirm, ConfirmDialog } = useConfirm();

  const API_BASE = "http://localhost:8000";

  const getTokenOrRedirect = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      toast.error("Session expired. Please log in again.", { position: "top-right" });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
      return null;
    }
    return token;
  }, [navigate]);

  const toDateInputValue = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const loadCurrentUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  const fetchUsers = useCallback(async () => {
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
  }, [getTokenOrRedirect]);

  useEffect(() => {
    loadCurrentUser();
    fetchUsers();
  }, [fetchUsers]);

  const openAdd = () => {
    setEditingId(null);
    setEditingInitial(null);
    setModal("add");
  };

  const openEdit = async (id) => {
    setEditingId(id);
    setModal("edit");

    // try from current list first
    const found = users.find((u) => u._id === id);
    if (found) {
      setEditingInitial({
        name: found.name || "",
        email: found.email || "",
        address: found.address || "",
        birthday: toDateInputValue(found.birthday),
        contactNumber: found.contactNumber || "",
      });
      return;
    }

    // fallback: fetch by id
    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      const res = await axios.get(`${API_BASE}/api/user/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const u = res.data?.result;
      setEditingInitial({
        name: u?.name || "",
        email: u?.email || "",
        address: u?.address || "",
        birthday: toDateInputValue(u?.birthday),
        contactNumber: u?.contactNumber || "",
      });
    } catch {
      toast.error("Failed to load user data.", { position: "top-right" });
    }
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setEditingInitial(null);
    setSubmitting(false);

    // If user came here via /add or /update/:id, normalize back to /user
    if (location.pathname !== "/user") navigate("/user");
  };

  // Support old routes: /add and /update/:id open modals automatically
  useEffect(() => {
    if (location.pathname === "/add") {
      openAdd();
    }
    if (location.pathname.startsWith("/update/") && params?.id) {
      openEdit(params.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, params?.id]);

  const deleteUser = async (id) => {
    const ok = await confirm({
      title: "Delete user",
      message: "Are you sure you want to delete this user?\nThis action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;

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

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Log out",
      message: "Are you sure you want to log out?",
      confirmText: "Log out",
      cancelText: "Cancel",
      variant: "default",
    });
    if (!ok) return;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const submitAdd = async (payload) => {
    try {
      setSubmitting(true);
      const token = getTokenOrRedirect();
      if (!token) return;

      const response = await axios.post(`${API_BASE}/api/user/register`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data?.message || "User created successfully!", { position: "top-right" });

      await fetchUsers();
      closeModal();
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Try again.";

      if ([401, 403].includes(status)) {
        toast.error("Unauthorized. Please log in again.", { position: "top-right" });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      toast.error(message, { position: "top-right" });
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async (payload) => {
    try {
      setSubmitting(true);
      const token = getTokenOrRedirect();
      if (!token) return;

      const response = await axios.put(`${API_BASE}/api/user/update/user/${editingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data?.message || "User updated successfully.", { position: "top-right" });

      await fetchUsers();
      closeModal();
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
    } finally {
      setSubmitting(false);
    }
  };

  const activePath = useMemo(() => {
    if (location.pathname.startsWith("/syslogs")) return "syslogs";
    return "users";
  }, [location.pathname]);

  return (
    <div className="dashPage">
      <div className="dashCard">
        <div className="dashLayout">
          {/* SIDEBAR */}
          <div className="dashSidebar">
            <button type="button" className={`dashLinkBtn dashLink ${activePath === "users" ? "active" : ""}`} onClick={openAdd}>
              <i className="fa-solid fa-user-plus"></i>
              Add User
            </button>

            <Link to="/syslogs" className={`dashLink ${activePath === "syslogs" ? "active" : ""}`}>
              <i className="fa-solid fa-clipboard-list"></i>
              System Logs
            </Link>

            <span onClick={handleLogout} className="dashLink danger">
              <i className="fa-solid fa-right-from-bracket"></i>
              Log Out
            </span>
          </div>

          {/* CONTENT */}
          <div className="dashContent">
            <div className="dashTopRow">
              <h1 className="dashHead">Welcome, {currentUser?.name || "User"}</h1>

              <button type="button" className="dashPrimaryBtn" onClick={openAdd}>
                <i className="fa-solid fa-plus"></i> New User
              </button>
            </div>

            <div className="tableWrap">
              <table className="dashTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Birthday</th>
                    <th>Contact Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="emptyRow">
                        No users found. Click “Add User” to create one.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, index) => (
                      <tr key={u._id}>
                        <td>{index + 1}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.address || "-"}</td>
                        <td>{u.birthday ? u.birthday.slice(0, 10) : "-"}</td>
                        <td>{u.contactNumber || "-"}</td>

                        <td>
                          <div className="actionCell">
                            <button type="button" onClick={() => openEdit(u._id)} className="iconBtn edit">
                              <i className="fa-solid fa-pen"></i>
                            </button>

                            <button type="button" onClick={() => deleteUser(u._id)} className="iconBtn delete">
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {modal === "add" ? (
        <Modal
          title="Add New User"
          onClose={closeModal}
          footer={null}
        >
          <UserForm mode="add" initial={null} onSubmit={submitAdd} onCancel={closeModal} submitting={submitting} />
        </Modal>
      ) : null}

      {modal === "edit" ? (
        <Modal
          title="Update User"
          onClose={closeModal}
          footer={null}
        >
          <UserForm mode="edit" initial={editingInitial} onSubmit={submitEdit} onCancel={closeModal} submitting={submitting} />
        </Modal>
      ) : null}

      <ConfirmDialog />
    </div>
  );
};

export default User;
