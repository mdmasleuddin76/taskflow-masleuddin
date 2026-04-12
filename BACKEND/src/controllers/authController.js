import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import logger from '../logger.js';
import { JWT_SECRET } from '../middleware/auth.js';

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const fields = {};

  if (!name) fields.name = "is required";
  if (!email) fields.email = "is required";
  if (!password) fields.password = "is required";

  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }

  try {
    const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "validation failed email already in use", fields: { email: "email already in use" } });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (id, name, email, password) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, created_at`,
      [userId, name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    setAuthCookie(res, token);
    
    logger.info({ user_id: user.id }, 'New user registered');
    res.status(201).json({ user, token });

  } catch (err) {
    logger.error(err, 'Error during registration');
    res.status(500).json({ error: "internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const fields = {};

  if (!email) fields.email = "is required";
  if (!password) fields.password = "is required";

  if (Object.keys(fields).length > 0) {
    return res.status(400).json({ error: "validation failed", fields });
  }

  try {
    const result = await pool.query('SELECT id, name, email, password FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "unauthenticated: invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "unauthenticated: invalid credentials" });
    }

    const token = jwt.sign({ user_id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    setAuthCookie(res, token);

    delete user.password;

    logger.info({ user_id: user.id }, 'User logged in');
    res.status(200).json({ user, token });

  } catch (err) {
    logger.error(err, 'Error during login');
    res.status(500).json({ error: "internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.user_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "not found" });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    logger.error(err, 'Error fetching current user');
    res.status(500).json({ error: "internal server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: "logged out successfully" });
};