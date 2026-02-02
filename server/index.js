import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";

import routes from "./routes/userroutes.js";
import dynamicCrudRoutes from "./routes/dynamicCrudRoutes.js";
import dbconnect from "./database.js";

// register all models once
import "./model/models.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

dbconnect();

// existing routes
app.use("/api/user", routes);

// dynamic CRUD routes
app.use("/api/crud", dynamicCrudRoutes);

const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
