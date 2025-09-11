import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./routes/userroutes.js";
import dbconnect from "./database.js";
import http from 'http';
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json())
app.use(cors());
app.use(bodyParser.json());


const server = http.createServer(app)
const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;
const MONGO_LOG=process.env.MONGO_LOG;


dbconnect(); 

app.use("/api/user",route);


server.listen(PORT, () => console.log(`Server starting on port: ${PORT}`))