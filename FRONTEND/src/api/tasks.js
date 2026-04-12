// src/api/tasks.js
import apiClient from './client';

// Note: The take-home prompt specified creating tasks under the project route
export const createTask = async (projectId, taskData) => {
  // taskData should include: title, description, status, priority, due_date, assignee_id
  const response = await apiClient.post(`/projects/${projectId}/tasks`, taskData);
  return response.data;
};

// Updating and deleting tasks hit the /tasks route directly
export const updateTask = async (taskId, updateData) => {
  const response = await apiClient.patch(`/tasks/${taskId}`, updateData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

export const getTasks = async (projectId, filters) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.assignee_id) params.append('assignee', filters.assignee_id);
  
  const response = await apiClient.get(`/projects/${projectId}/tasks?${params.toString()}`);
  return response.data; // Expected: { tasks: [...] }
};