import React from 'react';
import { Trash2, Calendar, ClipboardList, RefreshCw, AlertCircle, ArrowUpRight } from 'lucide-react';

const TaskList = ({ tasks, onTaskUpdated, onTaskDeleted, onClearCompleted }) => {
  
  // Format due date elegantly
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDateCopy = new Date(date);
    dueDateCopy.setHours(0, 0, 0, 0);

    const diffTime = dueDateCopy - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options = { month: 'short', day: 'numeric' };
    const formatted = date.toLocaleDateString('en-US', options);

    if (diffDays < 0) {
      return { text: `Overdue (${formatted})`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due Today', isOverdue: false, highlight: true };
    } else if (diffDays === 1) {
      return { text: 'Due Tomorrow', isOverdue: false, highlight: true };
    } else {
      return { text: `Due ${formatted}`, isOverdue: false };
    }
  };

  // Toggle status between completed and pending
  const handleCheckToggle = (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    onTaskUpdated(task._id, { status: nextStatus });
  };

  // Cycle status: pending -> in-progress -> completed -> pending
  const handleCycleStatus = (task) => {
    let nextStatus = 'pending';
    if (task.status === 'pending') nextStatus = 'in-progress';
    else if (task.status === 'in-progress') nextStatus = 'completed';
    
    onTaskUpdated(task._id, { status: nextStatus });
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header controls for the list */}
      <div className="list-header">
        <h2 className="list-title">
          <ClipboardList size={22} style={{ color: 'var(--primary)' }} />
          Tasks List
          <span className="list-count">{tasks.length}</span>
        </h2>
        {completedCount > 0 && (
          <button 
            onClick={onClearCompleted} 
            className="btn btn-danger-outline"
            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem' }}
          >
            Clear Completed ({completedCount})
          </button>
        )}
      </div>

      {/* Main List */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} className="empty-state-icon" />
          <h3>No tasks found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
            Try adjusting your active filters or create a new task to get started!
          </p>
        </div>
      ) : (
        <div className="tasks-container">
          {tasks.map((task) => {
            const dateInfo = formatDueDate(task.dueDate);
            const isCompleted = task.status === 'completed';

            return (
              <div 
                key={task._id} 
                className={`task-card priority-${task.priority} status-${task.status}`}
              >
                <div className="task-main">
                  {/* Custom Checkbox circle */}
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={isCompleted}
                      onChange={() => handleCheckToggle(task)}
                    />
                    <span className="checkmark"></span>
                  </label>

                  {/* Task details */}
                  <div className="task-details">
                    <div className="task-title">
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="task-actions">
                    <button 
                      onClick={() => handleCycleStatus(task)}
                      className="action-btn"
                      title={`Change Status (Current: ${task.status})`}
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button 
                      onClick={() => onTaskDeleted(task._id)}
                      className="action-btn btn-delete"
                      title="Delete Task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="task-footer">
                  <div className="task-tags">
                    {/* Priority Pill */}
                    <span className={`badge badge-priority-${task.priority}`}>
                      {task.priority}
                    </span>

                    {/* Category Pill */}
                    <span className="badge badge-category">
                      {task.category}
                    </span>

                    {/* Status Pill */}
                    <span className="badge" style={{
                      backgroundColor: `var(--bg-${task.status === 'in-progress' ? 'progress' : task.status})`,
                      color: `var(--color-${task.status === 'in-progress' ? 'progress' : task.status})`
                    }}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status}
                    </span>
                  </div>

                  {/* Due Date Indicator */}
                  {dateInfo && (
                    <span className={`badge badge-date ${dateInfo.isOverdue ? 'overdue' : ''}`} style={dateInfo.highlight ? { borderColor: 'var(--color-medium)', color: 'var(--color-medium)', background: 'rgba(245,158,11,0.08)' } : {}}>
                      {dateInfo.isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                      {dateInfo.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;
