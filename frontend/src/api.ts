import axios from 'axios';
import type { User, UserCreate, UserUpdate, GraphData } from './types';

const getBackendURL = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    if (hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      const backendHost = hostname.replace(/:\d+$/, '');
      return `${protocol}//${backendHost}:8000/api`;
    }
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getBackendURL();

export const api = {
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  },

  async getUser(id: string): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  async createUser(data: UserCreate): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/users`, data);
    return response.data;
  },

  async updateUser(id: string, data: UserUpdate): Promise<User> {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
  },

  async linkUsers(userId: string, friendId: string): Promise<User> {
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/link`, {
      friend_id: friendId,
    });
    return response.data;
  },

  async unlinkUsers(userId: string, friendId: string): Promise<User> {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}/unlink`, {
      data: { friend_id: friendId },
    });
    return response.data;
  },

  async getGraphData(): Promise<GraphData> {
    const response = await axios.get(`${API_BASE_URL}/graph`);
    return response.data;
  },
};
