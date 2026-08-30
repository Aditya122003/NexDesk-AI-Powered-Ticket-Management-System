import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';
import CustomDateModal from '../components/CustomDateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import { useNotification } from '../context/NotificationContext';
import { Plus, Search, Filter, RefreshCw, Ticket as TicketIcon, Clock, CheckCircle2, AlertCircle, Calendar, LayoutGrid, List, Download } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ticketViewMode, setTicketViewMode] = useState('grid'); // 'grid' | 'list'

  // Date Range Filter State (Default: 2 Months)
  const [dateRange, setDateRange] = useState('2M'); // '1M' | '2M' | 'custom' | 'all'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate;
      let endDate;

      if (dateRange === '1M') {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = start.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (dateRange === '2M') {
        const start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        startDate = start.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (dateRange === 'custom') {
        if (customStartDate) startDate = customStartDate;
        if (customEndDate) endDate = customEndDate;
      }

      const params = {
        limit: 500, // Load all matching tickets in date range
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        startDate,
        endDate
      };
      const res = await API.get('/tickets', { params });
      if (res.data.success) {
        const sortedTickets = (res.data.data || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setTickets(sortedTickets);
      }
    } catch (error) {
      console.error('[CustomerDashboard] Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate, search, statusFilter, priorityFilter, categoryFilter]);

  const exportTicketsToCSV = () => {
    if (!tickets || tickets.length === 0) {
      showToast('No tickets available to export', 'info');
      return;
    }
    const headers = ['Ticket ID', 'Title', 'Customer Name', 'Customer Email', 'Category', 'Customer Priority', 'AI Classified Priority', 'Status', 'AI Triaged', 'Created Date'];
    const rows = tickets.map(t => [
      `"${t.ticketId}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.customer?.name || '').replace(/"/g, '""')}"`,
      `"${(t.customer?.email || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      `"${t.customerPriority || t.priority || ''}"`,
      `"${t.priority || ''}"`,
      `"${t.status || ''}"`,
      `"${t.aiTriaged ? 'Yes' : 'No'}"`,
      `"${new Date(t.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tickets_Repository_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported tickets list to CSV!', 'success');
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const progressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            {user?.role === 'customer' ? 'Customer Helpdesk Portal' : 'Ticket Repository'}
          </h1>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>
            {user?.role === 'customer' 
              ? `Welcome, ${user?.name}. Create, track, and manage your support requests.`
              : `Welcome, ${user?.name}. Viewing system ticket repository.`}
          </p>
        </div>

        {user?.role === 'customer' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <Plus size={18} /> Raise New Ticket
          </button>
        )}
      </div>

      {/* Quick Metrics */}
      <div className="grid-stats">
        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Total Requests</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#032d1f' }}>{tickets.length}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#032d1f', background: 'rgba(3, 45, 31, 0.1)' }}>
            <TicketIcon size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Open Tickets</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857' }}>{openCount}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#047857', background: 'rgba(4, 120, 87, 0.1)' }}>
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>In Progress</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309' }}>{progressCount}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#b45309', background: 'rgba(180, 83, 9, 0.1)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Resolved</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1d4ed8' }}>{resolvedCount}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#1d4ed8', background: 'rgba(29, 78, 216, 0.1)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search tickets by title, description or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} style={{ color: '#64748b' }} />
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="form-control"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="Account">Account</option>
            <option value="Feature Request">Feature Request</option>
            <option value="General">General</option>
          </select>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '3px', border: '1px solid #cbd5e1' }}>
            <button
              type="button"
              onClick={() => setTicketViewMode('grid')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: ticketViewMode === 'grid' ? '#047857' : 'transparent',
                color: ticketViewMode === 'grid' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
              title="Grid Cards View"
            >
              <LayoutGrid size={15} /> Grid
            </button>
            <button
              type="button"
              onClick={() => setTicketViewMode('list')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: ticketViewMode === 'list' ? '#047857' : 'transparent',
                color: ticketViewMode === 'list' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
              title="List Table View"
            >
              <List size={15} /> List
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={exportTicketsToCSV}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.825rem',
              fontWeight: 700
            }}
            title="Export Filtered Tickets to CSV"
          >
            <Download size={15} /> Export CSV
          </button>

          {/* Date Range Selector Pill Strip (Default: 2 Months) */}
          <div style={{ display: 'flex', gap: '3px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setDateRange('1M')}
              style={{
                padding: '5px 11px',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: dateRange === '1M' ? '#047857' : 'transparent',
                color: dateRange === '1M' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              1 Month
            </button>

            <button
              type="button"
              onClick={() => setDateRange('2M')}
              style={{
                padding: '5px 11px',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: dateRange === '2M' ? '#047857' : 'transparent',
                color: dateRange === '2M' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              2 Months
            </button>

            <button
              type="button"
              onClick={() => setIsCustomDateModalOpen(true)}
              style={{
                padding: '5px 11px',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: dateRange === 'custom' ? '#047857' : 'transparent',
                color: dateRange === 'custom' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              Custom Range
            </button>

            <button
              type="button"
              onClick={() => setDateRange('all')}
              style={{
                padding: '5px 11px',
                fontSize: '0.78rem',
                fontWeight: 800,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: dateRange === 'all' ? '#047857' : 'transparent',
                color: dateRange === 'all' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              All Time
            </button>
          </div>

          {/* Active Custom Date Badge */}
          {dateRange === 'custom' && customStartDate && customEndDate && (
            <div
              onClick={() => setIsCustomDateModalOpen(true)}
              style={{
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'center',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #a7f3d0',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 800
              }}
              title="Click to change custom date range"
            >
              <Calendar size={13} />
              <span>{customStartDate} to {customEndDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tickets List / Empty State / Loading State */}
      {loading ? (
        <LoadingSpinner message="Loading your support tickets..." fullPage={false} />
      ) : tickets.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#032d1f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <TicketIcon size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            No Support Tickets Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', marginBottom: '1.5rem' }}>
            You haven't raised any tickets matching the selected filters yet. Need help? Create a ticket below!
          </p>
          <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Create Support Ticket
          </button>
        </div>
      ) : ticketViewMode === 'grid' ? (
        <div className="grid-tickets">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onViewDetails={(t) => setSelectedTicket(t)}
              onTicketDeleted={() => fetchTickets()}
            />
          ))}
        </div>
      ) : (
        /* List View Table */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Ticket ID</th>
                <th style={{ padding: '1rem 1.25rem' }}>Title & Description</th>
                <th style={{ padding: '1rem 1.25rem' }}>Customer</th>
                <th style={{ padding: '1rem 1.25rem' }}>Category</th>
                <th style={{ padding: '1rem 1.25rem' }}>Priority</th>
                <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                <th style={{ padding: '1rem 1.25rem' }}>Created</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 900, color: '#047857', fontFamily: 'monospace' }}>
                    {t.ticketId}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{t.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.description}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#334155' }}>{t.customer?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.customer?.email}</div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <CategoryBadge category={t.category} />
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <PriorityBadge priority={t.customerPriority || t.priority || 'Medium'} type="customer" />
                      <PriorityBadge priority={t.priority || 'Medium'} type="ai" />
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: t.status === 'Resolved' ? '#dcfce7' : t.status === 'In Progress' ? '#fef3c7' : '#eff6ff',
                        color: t.status === 'Resolved' ? '#15803d' : t.status === 'In Progress' ? '#b45309' : '#1d4ed8',
                        border: `1px solid ${t.status === 'Resolved' ? '#86efac' : t.status === 'In Progress' ? '#fde68a' : '#bfdbfe'}`
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                    >
                      View / Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTicketCreated={() => {
          fetchTickets();
        }}
      />

      {/* Ticket Details Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onTicketUpdated={(updated) => {
          setSelectedTicket(updated);
          fetchTickets();
        }}
      />

      {/* Custom Date Range Picker Modal */}
      <CustomDateModal
        isOpen={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        startDate={customStartDate}
        endDate={customEndDate}
        onApply={(start, end) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
          setDateRange('custom');
        }}
      />
    </div>
  );
};

export default CustomerDashboard;
