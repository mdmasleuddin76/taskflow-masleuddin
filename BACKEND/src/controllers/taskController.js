import pool from '../db.js';
import logger from '../logger.js';

// Helper to verify if the current user owns the project a task belongs to
const verifyProjectOwnership = async (projectId, userId) => {
  const res = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
  if (res.rows.length === 0) return { status: 404, error: "project not found" };
  if (res.rows[0].owner_id !== userId) return { status: 403, error: "Unauthorized action: you do not own this project" };
  return null; // Passed
};

const verifyProjectAccess = async (projectId, userId) => {
  // 1. Check if they are the owner
  const res = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
  if (res.rows.length === 0) return { status: 404, error: "project not found" };
  if (res.rows[0].owner_id === userId) return null; // Passed as owner

  // 2. If not the owner, check if they are assigned to any task in this project
  const collabCheck = await pool.query(
    'SELECT 1 FROM tasks WHERE project_id = $1 AND assignee_id = $2 LIMIT 1',
    [projectId, userId]
  );
  if (collabCheck.rows.length > 0) return null; // Passed as assignee

  // 3. If neither, block them
  return { status: 403, error: "unauthorized action: you do not have access to this project" };
};
// POST /projects/:id/tasks
export const createTask = async (req, res) => {
  const { id: projectId } = req.params;
  let { title, description, status, priority, due_date, assignee_id } = req.body;

  // Strict Validation
  const fields = {};
  if (!title || title.trim() === '') fields.title = "is required";
  
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }

  // Clean up optional fields
  if (assignee_id === '') assignee_id = null;
  if (due_date === '') due_date = null;
  status = status || 'todo';
  priority = priority || 'medium';

  try {
    // 1. Verify Authorization
    // const authError = await verifyProjectOwnership(projectId, req.user.user_id);
    // if (authError) return res.status(authError.status).json({ error: authError.error });

    // 2. Insert Task
    const insertQuery = `
      INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, status, priority, project_id, assignee_id, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date, created_at
    `;
    const result = await pool.query(insertQuery, [
      title.trim(), description?.trim() || null, status, priority, projectId, assignee_id, due_date
    ]);

    const newTask = result.rows[0];

    // 3. Fetch Assignee Name for the Frontend
    if (newTask.assignee_id) {
      const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [newTask.assignee_id]);
      newTask.assignee_name = userRes.rows[0]?.name || null;
    } else {
      newTask.assignee_name = null;
    }

    logger.info({ task_id: newTask.id, project_id: projectId }, 'Task created');
    res.status(201).json(newTask);
  } catch (err) {
    logger.error(err, 'Error creating task');
    res.status(500).json({ error: "internal server error" });
  }
};

// PATCH /tasks/:id
export const updateTask = async (req, res) => {
  const { id: taskId } = req.params;
  let { title, description, status, priority, due_date, assignee_id } = req.body;

  const fields = {};
  if (!title || title.trim() === '') fields.title = "is required";
  
  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }

  if (assignee_id === '') assignee_id = null;
  if (due_date === '') due_date = null;

  try {
    // 1. Get task's project to verify ownership
    const taskRes = await pool.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (taskRes.rows.length === 0) return res.status(404).json({ error: "not found" });
    const projectId = taskRes.rows[0].project_id;

    // 2. Verify Authorization
    // const authError = await verifyProjectOwnership(projectId, req.user.user_id);
    // if (authError) return res.status(authError.status).json({ error: authError.error });

    // 3. Update Task
    const updateQuery = `
      UPDATE tasks 
      SET title = $1, description = $2, status = $3, priority = $4, assignee_id = $5, due_date = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, title, description, status, priority, project_id, assignee_id, TO_CHAR(due_date, 'YYYY-MM-DD') as due_date
    `;
    const result = await pool.query(updateQuery, [
      title.trim(), description?.trim() || null, status, priority, assignee_id, due_date, taskId
    ]);

    const updatedTask = result.rows[0];

    // 4. Fetch Assignee Name for the Frontend
    if (updatedTask.assignee_id) {
      const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [updatedTask.assignee_id]);
      updatedTask.assignee_name = userRes.rows[0]?.name || null;
    } else {
      updatedTask.assignee_name = null;
    }

    logger.info({ task_id: taskId }, 'Task updated');
    res.status(200).json(updatedTask);
  } catch (err) {
    logger.error(err, 'Error updating task');
    res.status(500).json({ error: "internal server error" });
  }
};
// GET /projects/:id/tasks?status=...&assignee=...
export const getProjectTasks = async (req, res) => {
  const { id: projectId } = req.params;
  const { status, assignee } = req.query;

  try {
    // CHANGED: Now uses verifyProjectAccess so assignees don't get blocked!
    const authError = await verifyProjectAccess(projectId, req.user.user_id);
    if (authError) return res.status(authError.status).json({ error: authError.error });

    let query = `
      SELECT t.id, t.title, t.description, t.status, t.priority, t.assignee_id, TO_CHAR(t.due_date, 'YYYY-MM-DD') as due_date, u.name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = $1
    `;
    const values = [projectId];
    let paramIndex = 2;

    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (assignee) {
      if (assignee === 'unassigned') {
        query += ` AND t.assignee_id IS NULL`;
      } else {
        query += ` AND t.assignee_id = $${paramIndex}`;
        values.push(assignee);
        paramIndex++;
      }
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, values);
    res.status(200).json({ tasks: result.rows });

  } catch (err) {
    logger.error(err, 'Error fetching tasks with filters');
    res.status(500).json({ error: "internal server error" });
  }
};
// DELETE /tasks/:id
export const deleteTask = async (req, res) => {
  const { id: taskId } = req.params;

  try {
    // 1. Check if task exists and get its project_id
    const taskRes = await pool.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    if (taskRes.rows.length === 0) return res.status(404).json({ error: "not found" });
    const projectId = taskRes.rows[0].project_id;

    // 2. Verify Authorization
    const authError = await verifyProjectOwnership(projectId, req.user.user_id);
    if (authError) return res.status(authError.status).json({ error: authError.error });

    // 3. Delete Task
    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    logger.info({ task_id: taskId }, 'Task deleted');
    res.status(200).json({ message: "task deleted successfully" });
  } catch (err) {
    logger.error(err, 'Error deleting task');
    res.status(500).json({ error: "internal server error" });
  }
};