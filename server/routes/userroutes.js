import express from "express"

import {create, deleteUser, getallusers, getuserID, login, register, update} from "../controller/usercontroller.js"

const route = express.Router();

//AUTHORIZATION
route.post("/registrar",register)
route.post("/login",login)

//CRUD
route.post("/register",create);
route.get("/users",getallusers);
route.get("/users/:id",getuserID);
route.put("/update/user/:id",update);
route.delete("/delete/user/:id",deleteUser);

export default route;