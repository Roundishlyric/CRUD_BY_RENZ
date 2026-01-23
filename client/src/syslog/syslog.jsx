import React, { useEffect, useState, useCallback } from "react";
import "../getuser/user.css"; // reuse same design as User page
import "./syslog.css";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Syslogs = () => {
  const [logs, setLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
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

      toast.error(error.response?.data?.message || "Failed to load system logs.", {
        position: "top-right",
      });
      console.log("SYSLOG FETCH ERROR:", status, error.response?.data || error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const clearLogs = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear ALL system logs?\nThis action cannot be undone."
    );
    if (!confirmClear) return;

    try {
      const token = getTokenOrRedirect();
      if (!token) return;

      await axios.delete(`${API_BASE}/api/user/syslogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("System logs cleared.", { position: "top-right" });
      setLogs([]); // clear UI immediately
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to clear system logs.",
        { position: "top-right" }
      );
      console.log("CLEAR LOGS ERROR:", error.response?.status, error.response?.data || error);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    fetchLogs();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);

    // Also refresh when user comes back to the tab
    const onFocus = () => fetchLogs();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchLogs]);

  return (
    <div className="userTable">
      <div className="d-flex align-items-center mb-4">
        {/* LEFT */}
        <div>
          <Link to="/user" type="button" className="btn btn-secondary">
            <i className="fa-solid fa-backward"></i> Back
          </Link>
        </div>

        {/* CENTER */}
        <div className="flex-grow-1 text-center">
          <h1 className="head mb-0">System Logs</h1>
        </div>

        {/* RIGHT */}
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-danger"
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            Clear Logs
          </button>
        </div>
      </div>

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th scope="col" className="name-panel">#</th>
            <th scope="col" className="name-panel">Action</th>
            <th scope="col" className="name-panel">Record ID</th>
            <th scope="col" className="name-panel">Who</th>
            <th scope="col" className="name-panel">When</th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No logs yet. Try Create/Update/Delete a user.
              </td>
            </tr>
          ) : (
            logs.map((log, index) => (
              <tr key={log._id}>
                <td>{index + 1}</td>
                <td>{log.action}</td>
                <td style={{ maxWidth: 260, wordBreak: "break-word" }}>
                  {log.recordId}
                </td>
                <td>{log.actorEmail || "unknown"}</td>
                <td>{log.at ? new Date(log.at).toLocaleString() : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Syslogs;
