import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Wifi, 
  WifiOff, 
  Database, 
  Cpu, 
  Layers, 
  SlidersHorizontal,
  PlusCircle, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { apiService } from './api';
import StatsDashboard from './components/StatsDashboard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0, categories: {}, priorities: {} });
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Backend Connection Mode
  const [fallbackMode, setFallbackMode] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Categories list for top filter chips
  const categories = ['All', 'Work', 'Personal', 'Shopping', 'Fitness', 'Others'];

  // Verify backend server health
  const verifyConnection = async () => {
    setCheckingConnection(true);
    const connected = await apiService.checkBackendHealth();
    setFallbackMode(!connected);
    setCheckingConnection(false);
    await loadData({ status, priority, category: activeCategory !== 'All' ? activeCategory : '', search });
  };

  // Load tasks and statistics
  const loadData = async (activeFilters = {}) => {
    setLoading(true);
    try {
      const fetchedTasks = await apiService.getTasks(activeFilters);
      const fetchedStats = await apiService.getStats();
      setTasks(fetchedTasks);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check health on mount, and reload tasks
  useEffect(() => {
    verifyConnection();
  }, []);

  // Update filters in real-time
  useEffect(() => {
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (activeCategory !== 'All') filters.category = activeCategory;
    if (search.trim()) filters.search = search.trim();

    loadData(filters);
  }, [status, priority, activeCategory, search]);

  // Operations
  const handleTaskAdded = async (taskData) => {
    await apiService.createTask(taskData);
    // Refresh
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (activeCategory !== 'All') filters.category = activeCategory;
    if (search.trim()) filters.search = search.trim();
    loadData(filters);
  };

  const handleTaskUpdated = async (id, updatedFields) => {
    await apiService.updateTask(id, updatedFields);
    // Refresh
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (activeCategory !== 'All') filters.category = activeCategory;
    if (search.trim()) filters.search = search.trim();
    loadData(filters);
  };

  const handleTaskDeleted = async (id) => {
    await apiService.deleteTask(id);
    // Refresh
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (activeCategory !== 'All') filters.category = activeCategory;
    if (search.trim()) filters.search = search.trim();
    loadData(filters);
  };

  const handleClearCompleted = async () => {
    await apiService.clearCompleted();
    // Refresh
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (activeCategory !== 'All') filters.category = activeCategory;
    if (search.trim()) filters.search = search.trim();
    loadData(filters);
  };

  return (
    <div className="app-container">
      {/* 1. Header */}
      <header>
        <div className="logo-container">
          <h1 className="logo-text">
            <Layers style={{ strokeWidth: 2.5 }} /> TASKORA
          </h1>
        
        </div>
        <p className="subtitle">
          A premium, high-performance task management system built on cosmic dark aesthetics.
        </p>
      </header>

      {/* 2. Fail-safe Standalone Mode Banner */}
      {fallbackMode && !checkingConnection && (
        <div className="fallback-banner">
          <WifiOff size={16} />
          <span>
            <strong>Standalone Offline Mode:</strong> Express / MongoDB Server not detected. 
            Falling back to local browser storage so you can test all features right now!
          </span>
          <button 
            onClick={verifyConnection} 
            className="btn" 
            style={{ 
              marginLeft: 'auto', 
              padding: '0.25rem 0.6rem', 
              fontSize: '0.75rem', 
              background: 'rgba(255,255,255,0.1)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
            title="Retry connecting to Express backend"
          >
            <RefreshCw size={10} style={{ marginRight: '0.25rem' }} /> Retry Connection
          </button>
        </div>
      )}

      {!fallbackMode && !checkingConnection && (
        <div className="fallback-banner" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
          <Wifi size={16} />
          <span>
            <strong>Connected to MongoDB Database:</strong> Synchronized perfectly with live Express server API!
          </span>
        </div>
      )}

      {/* 3. Left Column: Creation & Metadata */}
      <aside className="sidebar">
        <TaskForm onTaskAdded={handleTaskAdded} />
        
        {/* Architecture Specs Glass Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Cpu size={16} /> Technical Specifications
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
              <span>Frontend Framework</span>
              <strong style={{ color: 'var(--text-primary)' }}>React 19 + Vite</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
              <span>Database Client</span>
              <strong style={{ color: 'var(--text-primary)' }}>MongoDB + Mongoose</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem' }}>
              <span>REST Server</span>
              <strong style={{ color: 'var(--text-primary)' }}>Node.js + Express</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Styling System</span>
              <strong style={{ color: 'var(--text-primary)' }}>Vanilla HSL CSS</strong>
            </li>
          </ul>
        </div>
      </aside>

      {/* 4. Right Column: Dashboard Analytics, Controls, & Tasks List */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Visual Analytics */}
        <StatsDashboard stats={stats} />

        {/* Search, Filter Toolbar & Category Chips */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          
          {/* Category Chips Selection */}
          <div className="category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`chip ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' && <FolderOpen size={13} style={{ marginRight: '0.25rem', display: 'inline', verticalAlign: 'middle' }} />}
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Select dropdowns toolbar */}
          <div className="toolbar">
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="input-glow search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filters-wrapper">
              <select
                className="input-glow filter-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <select
                className="input-glow filter-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List Component */}
        {loading ? (
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
            <div style={{ textAlign: 'center' }}>
              <RefreshCw className="empty-state-icon" size={32} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aligning with cosmic grid...</p>
            </div>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            onClearCompleted={handleClearCompleted}
          />
        )}
      </main>
    </div>
  );
}

export default App;
