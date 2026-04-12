import pool from '../db.js';
import logger from '../logger.js';

// GET /projects
// GET /projects
export const getProjects = async (req, res) => {
  try {
    // Advanced Query: Fetches projects the user owns OR is assigned to!
    const query = `
      SELECT 
        p.id, p.name, p.description, p.owner_id, p.created_at, 
        u.name as "ownerName",
        COUNT(t.id) as "totalTasks",
        COALESCE(SUM(CASE WHEN t.status = 'todo' THEN 1 ELSE 0 END), 0) as "todo",
        COALESCE(SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END), 0) as "in_progress",
        COALESCE(SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END), 0) as "done"
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.owner_id = $1 
         OR EXISTS (
           SELECT 1 FROM tasks t2 
           WHERE t2.project_id = p.id AND t2.assignee_id = $1
         )
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query, [req.user.user_id]);

    // Format the response for the React UI
    const projects = result.rows.map(proj => {
      const total = parseInt(proj.totalTasks);
      const done = parseInt(proj.done);
      
      return {
        id: proj.id,
        name: proj.name,
        description: proj.description,
        owner_id: proj.owner_id,
        created_at: proj.created_at,
        ownerName: proj.ownerName,
        stats: { 
          todo: parseInt(proj.todo), 
          in_progress: parseInt(proj.in_progress), 
          done: done, 
          total: total 
        },
        progress: total === 0 ? 0 : Math.round((done / total) * 100)
      };
    });

    res.status(200).json({ projects });
  } catch (err) {
    logger.error(err, 'Error fetching projects');
    res.status(500).json({ error: "internal server error" });
  }
};

// GET /projects/:id
// GET /projects/:id
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch Project Details
    const projQuery = `
      SELECT p.id, p.name, p.description, p.owner_id, p.created_at, u.name as "ownerName"
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `;
    const projResult = await pool.query(projQuery, [id]);

    if (projResult.rows.length === 0) {
      return res.status(404).json({ error: "not found" });
    }

    const project = projResult.rows[0];

    // 2. NEW AUTHORIZATION CHECK: Owner OR Assigned to a Task
    let isAuthorized = project.owner_id === req.user.user_id;

    // If they aren't the owner, check if they have at least one task assigned to them here
    if (!isAuthorized) {
      const collabCheck = await pool.query(
        'SELECT 1 FROM tasks WHERE project_id = $1 AND assignee_id = $2 LIMIT 1',
        [id, req.user.user_id]
      );
      if (collabCheck.rows.length > 0) {
        isAuthorized = true;
      }
    }

    // If still not authorized, kick them out
    if (!isAuthorized) {
      return res.status(403).json({ error: "unauthorized action: you do not have access to this project" });
    }
  
    // 4. Fetch all users for the assignee dropdown
    const teamQuery = `SELECT id, name FROM users`;
    const teamResult = await pool.query(teamQuery);
    const team_members = teamResult.rows;
    
    // Return the combined payload
    res.status(200).json({ project, team_members });
  } catch (err) {
    logger.error(err, 'Error fetching project details');
    res.status(500).json({ error: "internal server error" });
  }
};

// POST /projects
export const createProject = async (req, res) => {
  const { name, description } = req.body;

  // Strict Validation
  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      error: "validation failed name is required", 
      fields: { name: "is required" } 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, description, owner_id, created_at`,
      [name.trim(), description?.trim() || null, req.user.user_id]
    );

    const newProject = result.rows[0];
    
    // Fetch owner name to return immediately to the frontend
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.user_id]);
    newProject.ownerName = userRes.rows[0].name;
    
    // Inject default stats for the React UI since it's a brand new project
    newProject.stats = { todo: 0, in_progress: 0, done: 0, total: 0 };
    newProject.progress = 0;

    logger.info({ project_id: newProject.id, user_id: req.user.user_id }, 'Project created');
    res.status(201).json(newProject);
  } catch (err) {
    logger.error(err, 'Error creating project');
    res.status(500).json({ error: "internal server error" });
  }
};

// PATCH /projects/:id
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      error: "validation failed name is required", 
      fields: { name: "is required" } 
    });
  }

  try {
    // 1. Check if project exists
    const checkRes = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "Data not found" });
    }

    // 2. Strict Authorization check (403)
    if (checkRes.rows[0].owner_id !== req.user.user_id) {
      return res.status(403).json({ error: "unauthorized action: you do not own this project" });
    }

    // 3. Perform Update
    const updateRes = await pool.query(
      `UPDATE projects 
       SET name = $1, description = $2 
       WHERE id = $3 
       RETURNING id, name, description, owner_id, created_at`,
      [name.trim(), description?.trim() || null, id]
    );

    // Get owner name for the frontend
    const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.user_id]);
    
    // Note: If you do a hot update in React, stats will be preserved from the existing state
    const updatedProject = {
        ...updateRes.rows[0],
        ownerName: userRes.rows[0].name
    };

    logger.info({ project_id: id }, 'Project updated');
    res.status(200).json(updatedProject);
  } catch (err) {
    logger.error(err, 'Error updating project');
    res.status(500).json({ error: "internal server error" });
  }
};

// DELETE /projects/:id
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Check if project exists
    const checkRes = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: "not found" });
    }

    // 2. Strict Authorization check (403)
    if (checkRes.rows[0].owner_id !== req.user.user_id) {
      return res.status(403).json({ error: "unauthorized action: you do not own this project" });
    }

    // 3. Delete Project
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    logger.info({ project_id: id }, 'Project deleted');
    res.status(200).json({ message: "project deleted successfully" });
  } catch (err) {
    logger.error(err, 'Error deleting project');
    res.status(500).json({ error: "internal server error" });
  }
};