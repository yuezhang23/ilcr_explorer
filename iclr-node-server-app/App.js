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

// Enhanced database connection with monitoring
mongoose.connect(CONNECTION_STRING, {
  dbName: "iclr_2024",
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1
});

// Database connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

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

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStates[dbStatus] || 'unknown',
        readyState: dbStatus,
        connected: dbStatus === 1,
        host: mongoose.connection.host || 'unknown',
        port: mongoose.connection.port || 'unknown',
        name: mongoose.connection.name || 'unknown'
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      version: process.version
    };
    
    // If database is not connected, mark as unhealthy
    if (dbStatus !== 1) {
      healthData.status = 'unhealthy';
      healthData.database.error = 'Database connection failed';
      return res.status(503).json(healthData);
    }
    
    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Simple ping endpoint
app.get('/ping', (req, res) => {
  res.status(200).json({ 
    message: 'pong', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'unknown'
  });
});

// Database health check endpoint
app.get('/health/db', async (req, res) => {
  try {
    // Test actual database operation
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        collections: await mongoose.connection.db.listCollections().toArray().then(cols => cols.length),
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database operation failed',
      details: error.message,
      database: {
        connected: false,
        readyState: mongoose.connection.readyState
      }
    });
  }
});

// app.use(express.static('build'));
Iclr(app);
UserRoutes(app);
Public(app);
Prompt(app);

// Test(app);
app.listen(process.env.PORT || 4000);