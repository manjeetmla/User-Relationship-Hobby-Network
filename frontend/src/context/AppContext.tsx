import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, GraphData, UserCreate, UserUpdate } from '../types';
import { api } from '../api';
import toast from 'react-hot-toast';

interface AppContextType {
  users: User[];
  graphData: GraphData;
  loading: boolean;
  selectedUser: User | null;
  allHobbies: string[];
  fetchUsers: () => Promise<void>;
  fetchGraphData: () => Promise<void>;
  createUser: (data: UserCreate) => Promise<void>;
  updateUser: (id: string, data: UserUpdate) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  linkUsers: (userId: string, friendId: string) => Promise<void>;
  unlinkUsers: (userId: string, friendId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  addHobbyToUser: (userId: string, hobby: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const allHobbies = React.useMemo(() => {
    const hobbiesSet = new Set<string>();
    users.forEach(user => {
      user.hobbies.forEach(hobby => hobbiesSet.add(hobby));
    });
    return Array.from(hobbiesSet).sort();
  }, [users]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getGraphData();
      setGraphData(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to fetch graph data');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: UserCreate) => {
    try {
      setLoading(true);
      await api.createUser(data);
      await fetchUsers();
      await fetchGraphData();
      toast.success('User created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchGraphData]);

  const updateUser = useCallback(async (id: string, data: UserUpdate) => {
    try {
      setLoading(true);
      await api.updateUser(id, data);
      await fetchUsers();
      await fetchGraphData();
      toast.success('User updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchGraphData]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await api.deleteUser(id);
      await fetchUsers();
      await fetchGraphData();
      setSelectedUser(null);
      toast.success('User deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchGraphData]);

  const linkUsers = useCallback(async (userId: string, friendId: string) => {
    try {
      setLoading(true);
      await api.linkUsers(userId, friendId);
      await fetchUsers();
      await fetchGraphData();
      toast.success('Friendship created!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create friendship');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchGraphData]);

  const unlinkUsers = useCallback(async (userId: string, friendId: string) => {
    try {
      setLoading(true);
      await api.unlinkUsers(userId, friendId);
      await fetchUsers();
      await fetchGraphData();
      toast.success('Friendship removed!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to remove friendship');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchGraphData]);

  const addHobbyToUser = useCallback(async (userId: string, hobby: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      if (user.hobbies.includes(hobby)) {
        toast.error('User already has this hobby');
        return;
      }

      const updatedHobbies = [...user.hobbies, hobby];
      await updateUser(userId, { hobbies: updatedHobbies });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to add hobby');
    }
  }, [users, updateUser]);

  const value = {
    users,
    graphData,
    loading,
    selectedUser,
    allHobbies,
    fetchUsers,
    fetchGraphData,
    createUser,
    updateUser,
    deleteUser,
    linkUsers,
    unlinkUsers,
    setSelectedUser,
    addHobbyToUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
