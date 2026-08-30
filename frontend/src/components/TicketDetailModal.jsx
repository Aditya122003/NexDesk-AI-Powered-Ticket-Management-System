import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryBadge from './CategoryBadge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import { X, Paperclip, Download, Clock, Sparkles, Send, CheckCircle2, History } from 'lucide-react';

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
        onClose();
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
      <div
        className="modal-container"
        style={{
          maxWidth: '1150px',
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#032d1f', fontFamily: 'monospace', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                {ticket.ticketId}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.customerPriority || ticket.priority || 'Medium'} type="customer" />
              <PriorityBadge priority={ticket.priority || 'Medium'} type="ai" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3, margin: 0 }}>
              {ticket.title}
            </h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px', minWidth: '32px', minHeight: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* 2-Column Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Column: AI Banner, Description, Attachment & Admin Action Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* AI Insight banner if applicable */}
            {ticket.aiTriaged && ticket.aiReasoning && (
              <div
                style={{
                  backgroundColor: '#f3e8ff',
                  border: '1.5px solid #e9d5ff',
                  borderRadius: '14px',
                  padding: '0.9rem 1.15rem'
                }}
              >
                <div style={{ fontWeight: 800, color: '#7e22ce', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <Sparkles size={16} /> Groq LLM Triage Intelligence
                </div>
                <p style={{ fontSize: '0.85rem', color: '#581c87', margin: 0, lineHeight: 1.45, fontWeight: 600 }}>
                  {ticket.aiReasoning}
                </p>
              </div>
            )}

            {/* Ticket Description */}
            <div>
              <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
                Issue Description
              </h4>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.55,
                  fontWeight: 500
                }}
              >
                {ticket.description}
              </div>
            </div>

            {/* Attachment Download */}
            {ticket.attachment && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1.5px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Paperclip size={18} style={{ color: '#1d4ed8' }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
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
                  border: '1.5px solid #a7f3d0',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.05)'
                }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#047857', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} style={{ color: '#059669' }} /> Admin Status & Category Control
                </h4>
                <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Row 1: Status & Category Selects */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.725rem', fontWeight: 800, color: '#047857', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STATUS</label>
                      <select
                        className="form-control"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{ fontWeight: 700, borderRadius: '10px' }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.725rem', fontWeight: 800, color: '#047857', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>CATEGORY</label>
                      <select
                        className="form-control"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        style={{ fontWeight: 700, borderRadius: '10px' }}
                      >
                        <option value="Uncategorized">⚠️ Uncategorized</option>
                        <option value="Technical">🔧 Technical</option>
                        <option value="Billing">💳 Billing</option>
                        <option value="Account">👤 Account</option>
                        <option value="Feature Request">✨ Feature Request</option>
                        <option value="General">❓ General</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Compulsory Admin Note */}
                  <div>
                    <label style={{ fontSize: '0.725rem', fontWeight: 800, color: '#047857', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ADMIN NOTE <span style={{ color: '#dc2626', fontWeight: 900 }}>* (REQUIRED)</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Enter compulsory admin update note..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: !statusNote.trim() ? '1.5px solid #fca5a5' : '1.5px solid #a7f3d0',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        resize: 'vertical',
                        minHeight: '65px',
                        lineHeight: 1.45,
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>

                  {/* Row 3: Submit Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button
                      type="submit"
                      disabled={!statusNote.trim() || updating}
                      className="btn btn-primary"
                      style={{
                        padding: '8px 20px',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        gap: '6px',
                        borderRadius: '10px',
                        backgroundColor: (!statusNote.trim() || updating) ? '#94a3b8' : '#047857',
                        borderColor: (!statusNote.trim() || updating) ? '#cbd5e1' : '#047857',
                        opacity: (!statusNote.trim() || updating) ? 0.65 : 1,
                        cursor: (!statusNote.trim() || updating) ? 'not-allowed' : 'pointer',
                        boxShadow: (!statusNote.trim() || updating) ? 'none' : '0 4px 12px rgba(4, 120, 87, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Send size={15} /> {updating ? 'Updating Ticket...' : 'Update Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Customer Info & Status History Timeline (Immediately Visible without Scroll) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Submitted By & Category Panel */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                  Submitted By
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img
                    src={ticket.customer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.customer?.name}`}
                    alt={ticket.customer?.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>{ticket.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{ticket.customer?.email}</div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                  Category & Date Created
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <CategoryBadge category={ticket.category} />
                  <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} style={{ color: '#047857' }} />
                    {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Status History Timeline Panel */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.15rem', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.825rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <History size={15} style={{ color: '#047857' }} /> Status History Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem' }}>
                {/* Timeline vertical bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    bottom: '6px',
                    left: '5px',
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
                          left: '-1.25rem',
                          top: '3px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: history.status === 'Resolved' ? '#10b981' : history.status === 'In Progress' ? '#f59e0b' : '#3b82f6',
                          border: '2px solid #ffffff'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <StatusBadge status={history.status} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                            by {history.changedBy?.name || 'User'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>
                          {new Date(history.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {history.note && (
                        <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '3px', fontStyle: 'italic', fontWeight: 500, backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          "{history.note}"
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.825rem', color: '#64748b' }}>No status changes recorded yet.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
