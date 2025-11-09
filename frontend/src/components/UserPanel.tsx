import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserCreate } from '../types';

const UserPanel: React.FC = () => {
  const { createUser, updateUser, deleteUser, users, loading } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    hobbies: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hobbiesArray = formData.hobbies
      .split(',')
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const userData = {
      username: formData.username,
      age: parseInt(formData.age),
      hobbies: hobbiesArray,
    };

    try {
      if (editingUserId) {
        await updateUser(editingUserId, userData);
      } else {
        await createUser(userData as UserCreate);
      }
      resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      age: user.age.toString(),
      hobbies: user.hobbies.join(', '),
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? All friendships must be removed first.')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ username: '', age: '', hobbies: '' });
    setEditingUserId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Users</h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {isFormOpen ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              required
              min="1"
              max="150"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hobbies (comma-separated)
            </label>
            <input
              type="text"
              value={formData.hobbies}
              onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
              placeholder="Reading, Gaming, Coding"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {editingUserId ? 'Update' : 'Create'}
            </button>
            {editingUserId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-2">
        {loading && users.length === 0 ? (
          <div className="text-gray-400 text-center py-8">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No users yet. Create one to get started!</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-gray-800">{user.username}</div>
                  <div className="text-sm text-gray-600">Age: {user.age}</div>
                  <div className="text-xs text-gray-500">
                    Score: {user.popularity_score.toFixed(1)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {user.hobbies.length > 0 && (
                <div className="text-xs text-gray-600">
                  {user.hobbies.slice(0, 3).join(', ')}
                  {user.hobbies.length > 3 && ` +${user.hobbies.length - 3} more`}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                Friends: {user.friends.length}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserPanel;
