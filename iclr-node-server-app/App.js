import "dotenv/config";
import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import UserRoutes from "./04Users/routes.js";
import Iclr from "./02ICLR/routes.js";
import Public from "./03PublicComments/routes.js";
import Prompt from "./05Prompt/routes.js";
import Test from "./Test.js";

const app = express();
const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
mongoose.connect(CONNECTION_STRING, {dbName: "iclr_2024"});

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "https://localhost:3000"
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log('Blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// app.use(express.static('build'));
Iclr(app);
UserRoutes(app);
Public(app);
Prompt(app);

// Test(app);
app.listen(process.env.PORT || 4000);