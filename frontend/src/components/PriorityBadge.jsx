import React from 'react';
import { Flame, ShieldAlert, ArrowUp, ArrowDown, User, Sparkles } from 'lucide-react';

const PriorityBadge = ({ priority = 'Medium', type = 'default', label }) => {
  let badgeClass = 'badge-priority-medium';
  let Icon = ArrowUp;

  if (priority === 'Urgent') {
    badgeClass = 'badge-priority-urgent';
    Icon = Flame;
  } else if (priority === 'High') {
    badgeClass = 'badge-priority-high';
    Icon = ShieldAlert;
  } else if (priority === 'Low') {
    badgeClass = 'badge-priority-low';
    Icon = ArrowDown;
  }

  if (type === 'customer') {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: priority === 'Urgent' ? '#fef2f2' : priority === 'High' ? '#fff7ed' : priority === 'Medium' ? '#fefce8' : '#f0fdf4',
          color: priority === 'Urgent' ? '#991b1b' : priority === 'High' ? '#c2410c' : priority === 'Medium' ? '#854d0e' : '#166534',
          border: priority === 'Urgent' ? '1px solid #fca5a5' : priority === 'High' ? '1px solid #ffedd5' : priority === 'Medium' ? '1px solid #fef08a' : '1px solid #bbf7d0',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '12px',
          fontSize: '0.73rem',
          fontWeight: 800
        }}
        title={`Customer Form Selected Priority: ${priority}`}
      >
        <User size={12} style={{ opacity: 0.85 }} />
        <span>{label || `Customer Priority: ${priority}`}</span>
      </span>
    );
  }

  if (type === 'ai') {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: priority === 'Urgent' ? '#fdf4ff' : priority === 'High' ? '#fae8ff' : priority === 'Medium' ? '#f3e8ff' : '#f5f3ff',
          color: priority === 'Urgent' ? '#86198f' : priority === 'High' ? '#7e22ce' : priority === 'Medium' ? '#6b21a8' : '#5b21b6',
          border: priority === 'Urgent' ? '1px solid #f0abfc' : priority === 'High' ? '1px solid #e9d5ff' : priority === 'Medium' ? '1px solid #d8b4fe' : '1px solid #ddd6fe',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '12px',
          fontSize: '0.73rem',
          fontWeight: 800
        }}
        title={`AI Classified Priority: ${priority}`}
      >
        <Sparkles size={12} style={{ color: '#7e22ce' }} />
        <span>{label || `AI Priority: ${priority}`}</span>
      </span>
    );
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <Icon size={13} />
      {label || priority}
    </span>
  );
};

export default PriorityBadge;
