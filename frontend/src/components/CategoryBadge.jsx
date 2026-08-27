import React from 'react';
import { Tag, Wrench, CreditCard, User, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

const CategoryBadge = ({ category }) => {
  let icon = <Tag size={13} />;
  let extraStyle = {};

  if (category === 'Technical') icon = <Wrench size={13} />;
  else if (category === 'Billing') icon = <CreditCard size={13} />;
  else if (category === 'Account') icon = <User size={13} />;
  else if (category === 'Feature Request') icon = <Sparkles size={13} />;
  else if (category === 'General') icon = <HelpCircle size={13} />;
  else if (category === 'Uncategorized') {
    icon = <AlertCircle size={13} />;
    extraStyle = { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
  }

  return (
    <span className="badge badge-category" style={extraStyle}>
      {icon}
      {category || 'Uncategorized'}
    </span>
  );
};

export default CategoryBadge;
