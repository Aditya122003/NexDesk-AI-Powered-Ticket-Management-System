import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { X, Sparkles, Upload, FileText, Check, Loader2, Bot } from 'lucide-react';

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const { showToast } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customerPriority: 'Medium'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Reset form whenever modal opens & lock background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFormData({
        title: '',
        description: '',
        customerPriority: 'Medium'
      });
      setFile(null);
      setAiResult(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        showToast('File size exceeds 5MB limit', 'error');
        return;
      }
      setFile(selectedFile);
    }
  };

  // Groq AI Auto-Triage Preview Action
  const handleAiTriage = async () => {
    if (!formData.title || !formData.description) {
      showToast('Please fill in title and description before running Groq AI triage', 'error');
      return;
    }

    setAiLoading(true);
    try {
      const res = await API.post('/triage/analyze', {
        title: formData.title,
        description: formData.description
      });

      if (res.data.success) {
        const { category, priority, reasoning, suggestedSummary } = res.data.data;
        setAiResult({ priority, category, reasoning, suggestedSummary });
        showToast('⚡ Groq AI successfully analyzed ticket category & priority!', 'success');
      }
    } catch (error) {
      console.error('[CreateTicket] AI triage error:', error);
      showToast('AI analysis service temporarily unavailable', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please provide both title and description', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('customerPriority', formData.customerPriority);
      data.append('autoTriage', 'true'); // Auto-classify Category & Priority via AI

      if (file) {
        data.append('attachment', file);
      }

      const res = await API.post('/tickets', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showToast('Ticket created successfully! AI categorized your issue.', 'success');
        onTicketCreated(res.data.data);
        onClose();
      }
    } catch (error) {
      console.error('[CreateTicket] Submit error:', error);
      showToast(error.response?.data?.message || 'Failed to create ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ padding: '1.75rem', maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Create Support Ticket</h2>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>Submit your issue — Category will be auto-assigned by AI</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ticket Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g. Cannot log into mobile app after update"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Detailed Description *</label>
              <button
                type="button"
                onClick={handleAiTriage}
                disabled={aiLoading}
                className="btn btn-ai btn-sm"
              >
                {aiLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                Preview AI Category
              </button>
            </div>
            <textarea
              name="description"
              className="form-control"
              placeholder="Describe the steps to reproduce, error messages seen, and expected behavior..."
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          {aiResult ? (
            <div
              style={{
                background: '#f3e8ff',
                border: '1.5px solid #e9d5ff',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                color: '#6b21a8'
              }}
            >
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#7e22ce', marginBottom: '6px' }}>
                <Sparkles size={14} /> Groq AI Category Classification:
              </div>
              <p style={{ margin: '0 0 6px 0', lineHeight: 1.4 }}>{aiResult.reasoning}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#ffffff', color: '#7e22ce', padding: '2px 8px', borderRadius: '6px', border: '1px solid #d8b4fe' }}>
                  AI Category: Category: {aiResult.category}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, background: '#ffffff', color: '#7e22ce', padding: '2px 8px', borderRadius: '6px', border: '1px solid #d8b4fe' }}>
                  AI Priority: {aiResult.priority}
                </span>
              </div>
            </div>
          ) : (
            /* AI Auto-Category Banner */
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#475569',
                fontWeight: 600
              }}
            >
              <Bot size={18} style={{ color: '#047857', flexShrink: 0 }} />
              <span>
                <strong>✨ AI Auto-Categorization:</strong> Category will be automatically classified by Groq AI upon ticket submission.
              </span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Customer Priority</label>
            <select
              name="customerPriority"
              className="form-control"
              value={formData.customerPriority}
              onChange={handleInputChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Attachment (Optional, Max 5MB)</label>
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '10px',
                padding: '1.25rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input
                id="file-upload-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.zip"
              />
              <Upload size={24} style={{ color: '#047857', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                {file ? file.name : 'Click or drop file to upload attachment'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Supports PNG, JPG, PDF, DOCX, TXT up to 5MB
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
