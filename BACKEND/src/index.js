// src/index.js
import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import logger from './logger.js';
import pool from './db.js';

// --- IMPORT ROUTERS ---
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();

// --- GLOBAL MIDDLEWARE ---
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger })); 

// --- MOUNT ROUTERS ---
// This tells Express: "Send any request starting with /auth to the authRoutes file"
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

// --- ERROR HANDLING (404 Fallback) ---
app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

// --- SERVER STARTUP ---
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

// --- GRACEFUL SHUTDOWN ---
const shutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await pool.end();
      logger.info('Postgres pool closed');
      process.exit(0);
    } catch (err) {
      logger.error(err, 'Error during Postgres pool closure');
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));