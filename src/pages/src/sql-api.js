// src/sql-api.js
const API_URL = 'http://localhost:3001/api';

export const sqlApi = {
  // Получить всех пользователей
  getAllUsers: async (search = '', className = 'all') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (className && className !== 'all') params.append('class', className);
    
    const url = `${API_URL}/users${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status}`);
    }
    
    return await response.json();
  },

  // Добавить пользователя
  addUser: async (userData) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка добавления пользователя');
    }
    
    return await response.json();
  },

  // Удалить пользователя
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка удаления пользователя');
    }
    
    return await response.json();
  },

  // Получить статистику
  getStats: async () => {
    const response = await fetch(`${API_URL}/users/stats`);
    
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status}`);
    }
    
    return await response.json();
  }
};