import React from 'react';
import { CheckCircle2, Clock, Activity, ListTodo } from 'lucide-react';

const StatsDashboard = ({ stats }) => {
  const { total = 0, pending = 0, inProgress = 0, completed = 0 } = stats || {};

  // Calculate completion percentage
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // SVG Progress Ring calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="stats-container">
      {/* 4 Core Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <ListTodo size={20} />
          </div>
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={20} />
          </div>
          <span className="stat-value">{pending}</span>
          <span className="stat-label">Pending</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <Activity size={20} />
          </div>
          <span className="stat-value">{inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle2 size={20} />
          </div>
          <span className="stat-value">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Premium SVG Circular Completion Ring Card */}
      <div className="progress-ring-container">
        <div className="progress-ring-info">
          <span className="progress-ring-title">Overall Progress</span>
          <span className="progress-ring-desc">
            {completed} of {total} tasks completed
          </span>
        </div>
        <div className="progress-ring-visual">
          <svg width="70" height="70">
            {/* Background circle */}
            <circle
              stroke="rgba(255,255,255,0.03)"
              fill="transparent"
              strokeWidth="5"
              r={radius}
              cx="35"
              cy="35"
            />
            {/* Foreground circle */}
            <circle
              className="progress-ring-circle"
              stroke="url(#progressGradient)"
              fill="transparent"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              r={radius}
              cx="35"
              cy="35"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="progress-ring-text">{completionPercentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
