// src/api/projects.js
import apiClient from './client';

export const getProjects = async () => {
  const response = await apiClient.get('/projects');
  return response.data; // Expected: { projects: [...] }
};

export const getProjectById = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}`);
  return response.data; // Expected: { id, name, ..., tasks: [...] }
};

export const createProject = async (name, description) => {
  const response = await apiClient.post('/projects', { name, description });
  return response.data;
};

export const updateProject = async (projectId, name, description) => {
  const response = await apiClient.patch(`/projects/${projectId}`, { name, description });
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(`/projects/${projectId}`);
  return response.data;
};