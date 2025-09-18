import express from "express";
import {
  create,
  deleteUser,
  getallusers,
  getuserID,
  login,
  register,
  update,
} from "../controller/usercontroller.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const route = express.Router();

// AUTH
route.post("/registrar", register);
route.post("/login", login);

// PROTECTED CRUD ROUTES
route.post("/register", verifyToken, create);
route.get("/users", verifyToken, getallusers);
route.get("/users/:id", verifyToken, getuserID);
route.put("/update/user/:id", verifyToken, update);
route.delete("/delete/user/:id", verifyToken, deleteUser);

export default route;
