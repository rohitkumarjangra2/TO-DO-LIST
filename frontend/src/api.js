const API_BASE_URL = 'http://localhost:5000/api';

// Simple mock/local database to use as a fallback if the backend is not running
const getLocalTasks = () => {
  const tasks = localStorage.getItem('todo_tasks');
  if (!tasks) {
    // Initial mock tasks to make the page look wonderful on first launch
    const initialTasks = [
      {
        _id: 'mock-1',
        title: 'Design premium glassmorphic task dashboard',
        description: 'Complete the layout with Outfit typography, glowing priority stripes, and responsive grid layouts.',
        status: 'in-progress',
        priority: 'high',
        category: 'Work',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mock-2',
        title: 'Connect Mongoose models and Express routes',
        description: 'Build flexible tasks controller and integrate Mongoose models with proper CORS setup.',
        status: 'completed',
        priority: 'high',
        category: 'Work',
        dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        _id: 'mock-3',
        title: 'Weekly intense cardio & agility training',
        description: 'Hit the local track for interval sprints and speed ladder drills followed by stretching.',
        status: 'pending',
        priority: 'medium',
        category: 'Fitness',
        dueDate: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days from now
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mock-4',
        title: 'Pick up weekly fresh organic groceries',
        description: 'Buy avocados, wild berries, spinach, whole oats, and clean proteins from the farmer\'s market.',
        status: 'pending',
        priority: 'low',
        category: 'Shopping',
        dueDate: new Date(Date.now() + 120000).toISOString(), // Due soon!
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('todo_tasks', JSON.stringify(initialTasks));
    return initialTasks;
  }
  return JSON.parse(tasks);
};

const saveLocalTasks = (tasks) => {
  localStorage.setItem('todo_tasks', JSON.stringify(tasks));
};

export const apiService = {
  isFallbackMode: false,

  // Test if backend API is reachable
  async checkBackendHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        this.isFallbackMode = false;
        console.log('Successfully connected to Express backend.');
        return true;
      }
    } catch (e) {
      console.warn('Could not connect to Express backend. Falling back to standalone LocalStorage mode.');
    }
    this.isFallbackMode = true;
    return false;
  },

  // Get all tasks (with filtering)
  async getTasks(filters = {}) {
    if (this.isFallbackMode) {
      let tasks = getLocalTasks();
      const { status, priority, category, search } = filters;

      if (status) tasks = tasks.filter(t => t.status === status);
      if (priority) tasks = tasks.filter(t => t.priority === priority);
      if (category) tasks = tasks.filter(t => t.category === category);
      if (search) {
        const query = search.toLowerCase();
        tasks = tasks.filter(t => 
          (t.title && t.title.toLowerCase().includes(query)) || 
          (t.description && t.description.toLowerCase().includes(query))
        );
      }
      return tasks;
    }

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/tasks?${queryParams}`);
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      this.isFallbackMode = true;
      return this.getTasks(filters); // Try again in fallback mode
    }
  },

  // Get metrics
  async getStats() {
    if (this.isFallbackMode) {
      const tasks = getLocalTasks();
      const total = tasks.length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const inProgress = tasks.filter(t => t.status === 'in-progress').length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      
      const categories = { Work: 0, Personal: 0, Shopping: 0, Fitness: 0, Others: 0 };
      const priorities = { low: 0, medium: 0, high: 0 };

      tasks.forEach(t => {
        if (categories[t.category] !== undefined) categories[t.category]++;
        else categories.Others++;

        if (priorities[t.priority] !== undefined) priorities[t.priority]++;
      });

      return { total, pending, inProgress, completed, categories, priorities };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/stats`);
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      this.isFallbackMode = true;
      return this.getStats();
    }
  },

  // Create task
  async createTask(taskData) {
    if (this.isFallbackMode) {
      const tasks = getLocalTasks();
      const newTask = {
        _id: 'mock-' + Math.random().toString(36).substr(2, 9),
        ...taskData,
        createdAt: new Date().toISOString()
      };
      tasks.unshift(newTask);
      saveLocalTasks(tasks);
      return newTask;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      this.isFallbackMode = true;
      return this.createTask(taskData);
    }
  },

  // Update task
  async updateTask(id, taskData) {
    if (this.isFallbackMode) {
      const tasks = getLocalTasks();
      const index = tasks.findIndex(t => t._id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...taskData };
        saveLocalTasks(tasks);
        return tasks[index];
      }
      throw new Error('Task not found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      this.isFallbackMode = true;
      return this.updateTask(id, taskData);
    }
  },

  // Delete task
  async deleteTask(id) {
    if (this.isFallbackMode) {
      let tasks = getLocalTasks();
      tasks = tasks.filter(t => t._id !== id);
      saveLocalTasks(tasks);
      return { message: 'Task deleted' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      this.isFallbackMode = true;
      return this.deleteTask(id);
    }
  },

  // Clear completed tasks
  async clearCompleted() {
    if (this.isFallbackMode) {
      let tasks = getLocalTasks();
      const initialCount = tasks.length;
      tasks = tasks.filter(t => t.status !== 'completed');
      saveLocalTasks(tasks);
      return { message: 'All completed tasks deleted', count: initialCount - tasks.length };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/completed`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      this.isFallbackMode = true;
      return this.clearCompleted();
    }
  }
};
