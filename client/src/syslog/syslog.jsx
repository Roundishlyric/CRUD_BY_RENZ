import React, { useEffect, useState, useCallback } from "react";
import "../getuser/user.css";
import "./syslog.css";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import useConfirm from "../components/useConfirm";

const Syslogs = () => {
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE = "http://localhost:8000";

  const { confirm, ConfirmDialog } = useConfirm();

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

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      const token = getTokenOrRedirect();
      if (!token) return;

      const res = await axios.get(`${API_BASE}/api/user/syslogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogs(res.data?.result || []);
    } catch (error) {
      const status = error.response?.status;

      if ([401, 403].includes(status)) {
        toast.error("Unauthorized. Please log in again.", { position: "top-right" });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to load system logs.", { position: "top-right" });
      console.log("SYSLOG FETCH ERROR:", status, error.response?.data || error);
    } finally {
      setLoading(false);
    }
  }, [getTokenOrRedirect, navigate]);

  const clearLogs = async () => {
    const ok = await confirm({
      title: "Clear system logs",
      message: "Are you sure you want to clear ALL system logs?\nThis action cannot be undone.",
      confirmText: "Clear logs",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      await axios.delete(`${API_BASE}/api/user/syslogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("System logs cleared.", { position: "top-right" });
      setLogs([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clear system logs.", { position: "top-right" });
      console.log("CLEAR LOGS ERROR:", error.response?.status, error.response?.data || error);
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

  useEffect(() => {
    loadCurrentUser();
    fetchLogs();

    const interval = setInterval(fetchLogs, 5000);
    const onFocus = () => fetchLogs();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchLogs]);

return (
  <>
    <div className="dashPage">
      <div className="dashCard">
        <div className="dashLayout">
          {/* SIDEBAR */}
          <div className="dashSidebar">
            <Link to="/user" className="dashLink">
              <i className="fa-solid fa-users"></i>
              Users
            </Link>

            <Link to="/syslogs" className="dashLink active">
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
              <div>
                <h1 className="dashHead">System Logs</h1>
                <p className="sysSub">
                  Signed in as{" "}
                  <span className="sysEmail">{currentUser?.email || "unknown"}</span>
                </p>
              </div>

              <div className="sysActions">
                <button
                  type="button"
                  className="dashPrimaryBtn"
                  onClick={fetchLogs}
                  disabled={loading}
                >
                  <i className="fa-solid fa-rotate"></i>{" "}
                  {loading ? "Refreshing..." : "Refresh"}
                </button>

                <button
                  type="button"
                  className="sysDangerBtn"
                  onClick={clearLogs}
                  disabled={logs.length === 0}
                >
                  <i className="fa-solid fa-trash-can"></i> Clear Logs
                </button>
              </div>
            </div>

            <div className="tableWrap">
              <table className="dashTable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Action</th>
                    <th>Record ID</th>
                    <th>Who</th>
                    <th>When</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="emptyRow">
                        No logs yet. Try Create/Update/Delete a user.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => (
                      <tr key={log._id}>
                        <td>{index + 1}</td>
                        <td>{log.action}</td>
                        <td className="sysRecord">{log.recordId}</td>
                        <td>{log.actorEmail || "unknown"}</td>
                        <td>{log.at ? new Date(log.at).toLocaleString() : "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog />
  </>
);

};

export default Syslogs;
