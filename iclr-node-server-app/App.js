import "dotenv/config";
import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import UserRoutes from "./04Users/routes.js";
import Iclr from "./02ICLR/routes.js";
import Public from "./03PublicComments/routes.js";
import Prompt from "./05Prompt/routes.js";
import Test from "./Test.js";
import dotenv from 'dotenv';

const app = express();
const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
mongoose.connect(CONNECTION_STRING, {dbName: "iclr_2024"});

app.use(cors({
  credentials: true,
  origin: [process.env.FRONTEND_URL, "http://localhost:3000"] 
  // in .env and environment var
}));

app.use(express.json());

// app.use(express.static('build'));
Iclr(app);
UserRoutes(app);
Public(app);
Prompt(app);

// Test(app);
app.listen(process.env.PORT || 4000);