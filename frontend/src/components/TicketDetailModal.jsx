import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import { X, Paperclip, Download, Clock, User, Sparkles, Send, CheckCircle2 } from 'lucide-react';

const TicketDetailModal = ({ ticket, isOpen, onClose, onTicketUpdated }) => {
  const { isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [newStatus, setNewStatus] = useState(ticket?.status || 'Open');
  const [newCategory, setNewCategory] = useState(ticket?.category || 'Uncategorized');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status || 'Open');
      setNewCategory(ticket.category || 'Uncategorized');
    }
  }, [ticket]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await API.put(`/tickets/${ticket._id}/status`, {
        status: newStatus,
        category: newCategory,
        note: statusNote
      });

      if (res.data.success) {
        showToast(`Ticket details updated successfully`, 'success');
        onTicketUpdated(res.data.data);
        setStatusNote('');
      }
    } catch (error) {
      console.error('[TicketDetail] Status update error:', error);
      showToast(error.response?.data?.message || 'Failed to update ticket status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getAttachmentUrl = (urlPath) => {
    if (!urlPath) return '#';
    if (urlPath.startsWith('http')) return urlPath;
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return `${apiBase}${urlPath}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '750px', padding: '2rem', backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#032d1f', fontFamily: 'monospace' }}>
                {ticket.ticketId}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, margin: 0 }}>
              {ticket.title}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* AI Insight banner if applicable */}
        {ticket.aiTriaged && ticket.aiReasoning && (
          <div
            style={{
              backgroundColor: '#f3e8ff',
              border: '1px solid #e9d5ff',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ fontWeight: 800, color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', marginBottom: '4px' }}>
              <Sparkles size={16} /> Groq LLM Triage Intelligence
            </div>
            <p style={{ fontSize: '0.875rem', color: '#581c87', margin: 0, lineHeight: 1.4, fontWeight: 600 }}>
              {ticket.aiReasoning}
            </p>
          </div>
        )}

        {/* Ticket Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Description
          </h4>
          <div
            style={{
              backgroundColor: '#f8fafc',
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.925rem',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              fontWeight: 500
            }}
          >
            {ticket.description}
          </div>
        </div>

        {/* Meta Info & Attachment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
              Submitted By
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img
                src={ticket.customer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.customer?.name}`}
                alt={ticket.customer?.name}
                style={{ width: '28px', height: '28px', borderRadius: '50%' }}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>{ticket.customer?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{ticket.customer?.email}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
              Category & Created Date
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
              <CategoryBadge category={ticket.category} />
              <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
                {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Attachment Download */}
        {ticket.attachment && (
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Paperclip size={18} style={{ color: '#1d4ed8' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                  {ticket.attachment.originalName || ticket.attachment.filename}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                  {(ticket.attachment.size / 1024).toFixed(1)} KB • {ticket.attachment.mimeType}
                </div>
              </div>
            </div>
            <a
              href={getAttachmentUrl(ticket.attachment.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ gap: '4px' }}
            >
              <Download size={14} /> Download
            </a>
          </div>
        )}

        {/* Admin Workflow Action Panel */}
        {isAdmin && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Admin Status & Category Reclassification Control
            </h4>
            <form onSubmit={handleStatusUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 170px 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', display: 'block', marginBottom: '2px' }}>STATUS</label>
                  <select
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', display: 'block', marginBottom: '2px' }}>CATEGORY</label>
                  <select
                    className="form-control"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Uncategorized">⚠️ Uncategorized</option>
                    <option value="Technical">🔧 Technical</option>
                    <option value="Billing">💳 Billing</option>
                    <option value="Account">👤 Account</option>
                    <option value="Feature Request">✨ Feature Request</option>
                    <option value="General">❓ General</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', display: 'block', marginBottom: '2px' }}>ADMIN NOTE</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Optional admin note..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={updating} className="btn btn-primary btn-sm" style={{ marginTop: '14px' }}>
                  <Send size={14} /> Update Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Status History Timeline */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
            Status History Timeline
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
            {/* Timeline vertical bar */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                bottom: '6px',
                left: '7px',
                width: '2px',
                backgroundColor: '#cbd5e1'
              }}
            />

            {ticket.statusHistory && ticket.statusHistory.length > 0 ? (
              ticket.statusHistory.map((history, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Circle marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: history.status === 'Resolved' ? '#10b981' : history.status === 'In Progress' ? '#f59e0b' : '#3b82f6',
                      border: '2px solid #ffffff'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={history.status} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        by {history.changedBy?.name || 'User'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      {new Date(history.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {history.note && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px', fontStyle: 'italic', fontWeight: 500 }}>
                      "{history.note}"
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>No status changes recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
