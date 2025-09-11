import React, { useEffect, useState } from "react";
import "./user.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const User = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    //get logged-in user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    //FETCH USERS FOR TABLE
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/user/users");
        setUsers(response.data);
      } catch (error) {
        console.log("Error while fetching data.", error);
      }
    };
    fetchData();
  }, []);

  const deleteUser = async (userID) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/user/delete/user/${userID}`
      );
      setUsers((prevUser) => prevUser.filter((user) => user._id !== userID));
      toast.success(response.data.message, { position: "top-right" });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    //clear user data
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    toast.success("You have logged out successfully!", {
      position: "top-right",
    });

    navigate("/");
  };

  return (
    <div className="userTable">
      {/*Greeting for logged-in user only */}
      {currentUser && (
        <h1 className="head">Greetings, {currentUser.name}</h1>
      )}

      {/*Logout and Add User buttons*/}
      <button
        onClick={handleLogout}
        type="button"
        className="btn btn-danger me-3"
      >
        Log Out <i className="fa-solid fa-right-from-bracket"></i>
      </button>
      <Link to="/add" type="button" className="btn btn-danger">
        Add User <i className="fa-solid fa-user-plus"></i>
      </Link>

      {/* Table for all users */}
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th scope="col">Serial Number</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Address</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            return (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td className="actionbuttons">
                  <Link
                    to={`/update/${user._id}`}
                    type="button"
                    className="btn btn-danger"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </Link>
                  <button
                    onClick={() => deleteUser(user._id)}
                    type="button"
                    className="btn btn-dark ms-2"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default User;
