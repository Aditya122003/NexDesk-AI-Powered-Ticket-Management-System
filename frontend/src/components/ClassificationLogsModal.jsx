import React, { useState } from 'react';
import { X, Download, Calendar, Search, Sparkles, Clock } from 'lucide-react';

const ClassificationLogsModal = ({ isOpen, onClose, logs = [] }) => {
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter logs based on date range and search query
  const filteredLogs = logs.filter((ticket) => {
    const ticketDate = new Date(ticket.createdAt);
    const now = new Date();

    // Date Range Filter Logic
    let matchesDate = true;
    if (dateFilter === 'TODAY') {
      matchesDate = ticketDate.toDateString() === now.toDateString();
    } else if (dateFilter === '7DAYS') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesDate = ticketDate >= sevenDaysAgo;
    } else if (dateFilter === '30DAYS') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesDate = ticketDate >= thirtyDaysAgo;
    } else if (dateFilter === 'CUSTOM') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && ticketDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && ticketDate <= end;
      }
    }

    // Search Query Logic
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = ticket.customer?.name?.toLowerCase() || '';
      const email = ticket.customer?.email?.toLowerCase() || '';
      const title = ticket.title?.toLowerCase() || '';
      const desc = ticket.description?.toLowerCase() || '';
      const cat = ticket.category?.toLowerCase() || '';
      const prio = ticket.priority?.toLowerCase() || '';
      matchesSearch = name.includes(q) || email.includes(q) || title.includes(q) || desc.includes(q) || cat.includes(q) || prio.includes(q);
    }

    return matchesDate && matchesSearch;
  });

  // Download Filtered CSV Function
  const handleDownloadCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No logs available to export for the selected filter.');
      return;
    }

    const headers = [
      'Ticket ID',
      'Customer Name',
      'Customer Email',
      'Issue Title',
      'Issue Description',
      'AI Category',
      'AI Priority',
      'Status',
      'Created Date'
    ];

    const rows = filteredLogs.map((t) => [
      `"${t.ticketId || t._id}"`,
      `"${t.customer?.name || 'N/A'}"`,
      `"${t.customer?.email || 'N/A'}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.category || 'Uncategorized'}"`,
      `"${t.priority || 'Medium'}"`,
      `"${t.status || 'Open'}"`,
      `"${new Date(t.createdAt).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AI_Classification_Logs_${dateFilter}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden',
          border: '1.5px solid #cbd5e1'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar (Clean White Light Theme) */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1.5px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#f3e8ff', padding: '10px', borderRadius: '14px', border: '1px solid #d8b4fe' }}>
              <Sparkles size={22} style={{ color: '#7e22ce' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                Groq AI Classification & Triage Logs
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#7e22ce', fontWeight: 700 }}>
                Real-time AI categorization audit & customer issue history ({filteredLogs.length} Records)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleDownloadCSV}
              style={{
                backgroundColor: '#047857',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(4, 120, 87, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={16} /> Export Filtered CSV
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Controls & Filters Toolbar */}
        <div style={{ padding: '1.25rem 1.75rem', backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Field */}
            <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search by customer, title, category, priority..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            {/* Quick Date Filters (Light Theme Styled) */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#ffffff', padding: '3px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
              {[
                { id: 'ALL', label: 'All Time' },
                { id: 'TODAY', label: 'Today' },
                { id: '7DAYS', label: 'Last 7 Days' },
                { id: '30DAYS', label: 'Last 30 Days' },
                { id: 'CUSTOM', label: 'Custom Range' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  style={{
                    backgroundColor: dateFilter === f.id ? '#047857' : 'transparent',
                    color: dateFilter === f.id ? '#ffffff' : '#475569',
                    fontWeight: dateFilter === f.id ? 800 : 700,
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Picker inputs */}
          {dateFilter === 'CUSTOM' && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', width: 'fit-content' }}>
              <Calendar size={16} style={{ color: '#047857' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Logs List Container */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
              <Sparkles size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>No classification logs found</h3>
              <p style={{ fontSize: '0.875rem' }}>Try adjusting your date range filter or search term.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredLogs.map((ticket) => {
                const customer = ticket.customer || {};
                const priorityColors = {
                  Urgent: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
                  High: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
                  Medium: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
                  Low: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' }
                };
                const pStyle = priorityColors[ticket.priority] || priorityColors.Medium;

                return (
                  <div
                    key={ticket._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      border: '1.5px solid #cbd5e1',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Header: Customer Profile Info & Ticket ID */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            fontWeight: 900,
                            border: '1.5px solid #a7f3d0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.95rem'
                          }}
                        >
                          {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                            {customer.name || 'Anonymous User'} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({customer.role || 'Customer'})</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                            {customer.email || 'No Email'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          ID: {ticket.ticketId || ticket._id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {new Date(ticket.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Middle: User's Original Problem */}
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                        📌 Issue: {ticket.title}
                      </h4>
                      <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0, lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
                        "{ticket.description}"
                      </p>
                    </div>

                    {/* Footer: AI Classification Results & Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: '#fdf4ff', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #f5d0fe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#7e22ce', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={14} /> AI Classification:
                        </span>

                        <span style={{ fontSize: '0.8rem', fontWeight: 800, backgroundColor: '#ffffff', color: '#6366f1', padding: '3px 10px', borderRadius: '8px', border: '1.5px solid #c7d2fe' }}>
                          Category: {ticket.category}
                        </span>

                        <span style={{ fontSize: '0.8rem', fontWeight: 800, backgroundColor: pStyle.bg, color: pStyle.text, padding: '3px 10px', borderRadius: '8px', border: `1.5px solid ${pStyle.border}` }}>
                          Priority: {ticket.priority}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: ticket.status === 'Resolved' ? '#047857' : ticket.status === 'In Progress' ? '#b45309' : '#1d4ed8', backgroundColor: '#ffffff', padding: '3px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}>
                          Status: {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassificationLogsModal;
