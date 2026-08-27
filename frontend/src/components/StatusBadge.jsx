import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'badge-status-open';
  let icon = <AlertCircle size={13} />;

  if (status === 'In Progress') {
    badgeClass = 'badge-status-progress';
    icon = <Clock size={13} />;
  } else if (status === 'Resolved') {
    badgeClass = 'badge-status-resolved';
    icon = <CheckCircle2 size={13} />;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {icon}
      {status}
    </span>
  );
};

export default StatusBadge;
