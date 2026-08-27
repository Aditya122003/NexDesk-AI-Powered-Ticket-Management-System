import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import TicketCard from '../components/TicketCard';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';
import CustomDateModal from '../components/CustomDateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Search, Filter, RefreshCw, Ticket as TicketIcon, Clock, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

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
        search,
        status: statusFilter,
        priority: priorityFilter,
        startDate,
        endDate
      };
      const res = await API.get('/tickets', { params });
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (error) {
      console.error('[CustomerDashboard] Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate, search, statusFilter, priorityFilter]);

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

          <button onClick={fetchTickets} className="btn btn-secondary" style={{ padding: '0.75rem' }} title="Refresh Tickets">
            <RefreshCw size={16} />
          </button>
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
      ) : (
        <div className="grid-tickets">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onViewDetails={(t) => setSelectedTicket(t)}
            />
          ))}
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
