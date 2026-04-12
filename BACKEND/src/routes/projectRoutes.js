// src/routes/projectRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { createTask,getProjectTasks } from '../controllers/taskController.js';

const router = express.Router();

// Apply auth middleware to ALL routes in this file
router.use(requireAuth);

// Base Project Routes (mounted at /projects)
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

// Nested Task Route (mounted at /projects)
router.get('/:id/tasks', getProjectTasks);
router.post('/:id/tasks', createTask);

export default router;