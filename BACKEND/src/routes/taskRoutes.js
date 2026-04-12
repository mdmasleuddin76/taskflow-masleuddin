// src/routes/taskRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateTask, deleteTask } from '../controllers/taskController.js';

const router = express.Router();

// Apply auth middleware to ALL routes in this file
router.use(requireAuth);

// Task-specific routes (mounted at /tasks)
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;