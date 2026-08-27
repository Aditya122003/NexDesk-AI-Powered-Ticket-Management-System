import React from 'react';
import { Flame, ShieldAlert, ArrowUp, ArrowDown } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  let badgeClass = 'badge-priority-medium';
  let icon = <ArrowUp size={13} />;

  if (priority === 'Urgent') {
    badgeClass = 'badge-priority-urgent';
    icon = <Flame size={13} />;
  } else if (priority === 'High') {
    badgeClass = 'badge-priority-high';
    icon = <ShieldAlert size={13} />;
  } else if (priority === 'Low') {
    badgeClass = 'badge-priority-low';
    icon = <ArrowDown size={13} />;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {icon}
      {priority}
    </span>
  );
};

export default PriorityBadge;
