// src/routes/authRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { register, login, logout, getMe } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', requireAuth, getMe);

export default router;