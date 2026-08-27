import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import { Paperclip, Sparkles, Eye, Calendar } from 'lucide-react';

const TicketCard = ({ ticket, onViewDetails }) => {
  const raisedDate = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#032d1f', fontFamily: 'monospace' }}>
          {ticket.ticketId}
        </span>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {ticket.aiTriaged && (
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid #e9d5ff',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 700
              }}
              title={ticket.aiReasoning || 'AI Auto-Triaged with Groq'}
            >
              <Sparkles size={11} /> AI Classified
            </span>
          )}
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '0.5rem',
          lineHeight: 1.3,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {ticket.title}
      </h3>

      <p
        style={{
          fontSize: '0.85rem',
          color: '#475569',
          marginBottom: '0.75rem',
          flex: 1,
          lineHeight: 1.4,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {ticket.description}
      </p>

      {/* Date Raised Display */}
      {raisedDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Calendar size={13} style={{ color: '#047857' }} />
          <span>Raised on {raisedDate}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <PriorityBadge priority={ticket.priority} />
        <CategoryBadge category={ticket.category} />
        {ticket.attachment && (
          <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
            <Paperclip size={12} /> Attachment
          </span>
        )}
      </div>

      <div
        style={{
          paddingTop: '0.75rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src={ticket.customer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.customer?.name}`}
            alt={ticket.customer?.name}
            style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0' }}
          />
          <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 700 }}>
            {ticket.customer?.name || 'Customer'}
          </span>
        </div>

        <button
          onClick={() => onViewDetails(ticket)}
          className="btn btn-secondary btn-sm"
          style={{ gap: '4px' }}
        >
          <Eye size={14} /> Update Status
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
