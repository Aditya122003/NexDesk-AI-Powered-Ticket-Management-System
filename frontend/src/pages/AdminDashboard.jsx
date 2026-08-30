import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TicketCard from '../components/TicketCard';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import TicketDetailModal from '../components/TicketDetailModal';
import CustomDateModal from '../components/CustomDateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import {
  Search, Filter, RefreshCw, BarChart3, Shield, Ticket as TicketIcon,
  CheckCircle, XCircle, UserCheck, Crown, Users, Trash2, Mail,
  Download, LayoutGrid, List, Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'users'
  const [ticketViewMode, setTicketViewMode] = useState('grid'); // 'grid' | 'list'
  const [tickets, setTickets] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Date Range Filter State (Default: 2 Months)
  const [dateRange, setDateRange] = useState('2M'); // '1M' | '2M' | 'custom' | 'all'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);

  // Pending Admin Approval Requests
  const [pendingAdmins, setPendingAdmins] = useState([]);

  // System Users List
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const isSuperadmin = user?.email === 'adityatiwari5175@gmail.com' || user?.role === 'superadmin';

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
        limit: 500, // Fetch all matching tickets in date range
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
      console.error('[AdminDashboard] Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStartDate, customEndDate, search, statusFilter, priorityFilter, categoryFilter]);

  const fetchPendingAdmins = useCallback(async () => {
    if (!isSuperadmin) return;
    try {
      const res = await API.get('/admin/pending-admins');
      if (res.data.success) {
        setPendingAdmins(res.data.data);
      }
    } catch (error) {
      console.error('[AdminDashboard] Error fetching pending admins:', error);
    }
  }, [isSuperadmin]);

  const fetchAllUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setAllUsers(res.data.data);
      }
    } catch (error) {
      console.error('[AdminDashboard] Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchPendingAdmins();
    fetchAllUsers();
  }, [fetchTickets, fetchPendingAdmins, fetchAllUsers]);

  // Approve Admin Action
  const handleApproveAdmin = async (adminId, adminName, adminEmail) => {
    try {
      const res = await API.put(`/admin/approve-admin/${adminId}`);
      if (res.data.success) {
        showToast(`Approved ${adminName} as Admin! Email notification sent to ${adminEmail}`, 'success');
        fetchPendingAdmins();
        fetchAllUsers();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve admin', 'error');
    }
  };

  // Reject Admin Action
  const handleRejectAdmin = async (adminId, adminName) => {
    try {
      const res = await API.delete(`/admin/reject-admin/${adminId}`);
      if (res.data.success) {
        showToast(`Rejected admin request for ${adminName}`, 'info');
        fetchPendingAdmins();
        fetchAllUsers();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject admin', 'error');
    }
  };

  // Delete Any User (Admin or Customer)
  const handleDeleteUser = (userId, userName, userRole) => {
    setUserToDelete({ id: userId, name: userName, role: userRole });
  };

  const confirmExecuteDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await API.delete(`/admin/users/${userToDelete.id}`);
      if (res.data.success) {
        showToast(`Deleted ${userToDelete.role} '${userToDelete.name}' successfully!`, 'success');
        setUserToDelete(null);
        fetchAllUsers();
        fetchTickets();
        fetchPendingAdmins();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const paginatedUsers = filteredUsers;

  const exportUsersToCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      showToast('No users available to export', 'info');
      return;
    }
    const headers = ['Name', 'Email', 'Role', 'Approval Status', 'Joined Date'];
    const rows = filteredUsers.map(u => [
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.role || '').replace(/"/g, '""')}"`,
      `"${u.isApproved ? 'Active' : 'Pending Approval'}"`,
      `"${new Date(u.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `User_Accounts_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported user list to CSV!', 'success');
  };

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
    link.setAttribute('download', `Tickets_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported tickets list to CSV!', 'success');
  };

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Admin Command Center
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                background: isSuperadmin ? '#fef3c7' : '#ecfdf5',
                color: isSuperadmin ? '#92400e' : '#065f46',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '12px',
                border: isSuperadmin ? '1px solid #fde68a' : '1px solid #a7f3d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isSuperadmin ? <Crown size={13} /> : <Shield size={13} />}
              {isSuperadmin ? 'SUPERADMIN MODE' : 'ADMIN MODE'}
            </span>
          </div>
          <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>
            Manage support tickets, approve pending admin requests, and manage system accounts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              backgroundColor: activeTab === 'tickets' ? '#032d1f' : '#ffffff',
              color: activeTab === 'tickets' ? '#a3e635' : '#475569',
              fontWeight: activeTab === 'tickets' ? 900 : 700,
              padding: '0.65rem 1.35rem',
              borderRadius: '9999px',
              border: activeTab === 'tickets' ? '2px solid #032d1f' : '1.5px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'tickets'
                ? '0 6px 16px -2px rgba(3, 45, 31, 0.35), 0 0 0 3px rgba(163, 230, 53, 0.4)'
                : '0 2px 4px rgba(0, 0, 0, 0.03)',
              transform: activeTab === 'tickets' ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <TicketIcon size={16} style={{ color: activeTab === 'tickets' ? '#a3e635' : '#64748b' }} /> Manage Tickets
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              backgroundColor: activeTab === 'users' ? '#032d1f' : '#ffffff',
              color: activeTab === 'users' ? '#a3e635' : '#475569',
              fontWeight: activeTab === 'users' ? 900 : 700,
              padding: '0.65rem 1.35rem',
              borderRadius: '9999px',
              border: activeTab === 'users' ? '2px solid #032d1f' : '1.5px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'users'
                ? '0 6px 16px -2px rgba(3, 45, 31, 0.35), 0 0 0 3px rgba(163, 230, 53, 0.4)'
                : '0 2px 4px rgba(0, 0, 0, 0.03)',
              transform: activeTab === 'users' ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <Users size={16} style={{ color: activeTab === 'users' ? '#a3e635' : '#64748b' }} /> User Accounts ({allUsers.length})
          </button>
          <button
            onClick={() => navigate('/admin/analytics')}
            style={{
              backgroundColor: '#032d1f',
              color: '#a3e635',
              fontWeight: 800,
              padding: '0.6rem 1.2rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart3 size={16} /> Analytics
          </button>
        </div>
      </div>

      {/* Superadmin / Pending Admin Approval Section */}
      {isSuperadmin && pendingAdmins.length > 0 && (
        <div
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            borderRadius: '16px',
            border: '2px solid #fde68a',
            backgroundColor: '#fffbeb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} style={{ color: '#b45309' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350f', margin: 0 }}>
                Pending Admin Approval Requests ({pendingAdmins.length})
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 700 }}>
              Superadmin: <strong>adityatiwari5175@gmail.com</strong>
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {pendingAdmins.map((pAdmin) => (
              <div
                key={pAdmin._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{pAdmin.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{pAdmin.email}</div>
                  <span style={{ fontSize: '0.7rem', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block', fontWeight: 800 }}>
                    Status: Pending Approval
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleApproveAdmin(pAdmin._id, pAdmin.name, pAdmin.email)}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 800,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectAdmin(pAdmin._id, pAdmin.name)}
                    style={{
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontWeight: 700,
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: TICKETS MANAGEMENT */}
      {activeTab === 'tickets' && (
        <>
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
                placeholder="Search all tickets by title, customer, description or ticket ID..."
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
                style={{ width: '150px' }}
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
                    padding: '6px 10px',
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
                    padding: '6px 10px',
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
                  padding: '0.6rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  fontWeight: 800
                }}
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
                  onClick={() => {
                    setIsCustomDateModalOpen(true);
                  }}
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

          {/* Ticket Display Container with Smooth In-Place Loading */}
          <div style={{ position: 'relative', minHeight: '480px' }}>
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px'
                }}
              >
                <LoadingSpinner message="Fetching & Syncing NexDesk Tickets..." fullPage={false} />
              </div>
            )}

            {!loading && tickets.length === 0 ? (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '4rem 2rem', textAlign: 'center' }}>
                <TicketIcon size={40} style={{ color: '#64748b', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  No Matching Tickets Found
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Try clearing or adjusting search filters.
                </p>
              </div>
            ) : (
              <>
                {ticketViewMode === 'grid' ? (
                  <div className="grid-tickets">
                    {tickets.map((ticket) => (
                      <TicketCard
                        key={ticket._id}
                        ticket={ticket}
                        onViewDetails={(t) => setSelectedTicket(t)}
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
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  background: t.status === 'Resolved' ? '#ecfdf5' : t.status === 'In Progress' ? '#eff6ff' : '#fffbeb',
                                  color: t.status === 'Resolved' ? '#047857' : t.status === 'In Progress' ? '#1d4ed8' : '#b45309',
                                  border: t.status === 'Resolved' ? '1px solid #a7f3d0' : t.status === 'In Progress' ? '1px solid #bfdbfe' : '1px solid #fde68a'
                                }}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.25rem', color: '#64748b', fontSize: '0.8rem' }}>
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedTicket(t)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontWeight: 800, color: '#047857', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                              >
                                Update Status
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* TAB 2: USER ACCOUNTS MANAGEMENT */}
      {activeTab === 'users' && (
        <div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search user accounts by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={exportUsersToCSV}
                className="btn btn-secondary"
                style={{
                  padding: '0.6rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  fontWeight: 800
                }}
              >
                <Download size={15} /> Export Users CSV
              </button>
            </div>
          </div>

          {usersLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading user directory...</div>
          ) : (
            <>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      <th style={{ padding: '1rem 1.25rem' }}>User</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Email</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Role</th>
                      <th style={{ padding: '1rem 1.25rem' }}>Approval Status</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => {
                      const isSuperadminUser = u.email === 'adityatiwari5175@gmail.com' || u.role === 'superadmin';
                      return (
                        <tr key={u._id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            {u.name}
                          </td>
                          <td style={{ padding: '1rem 1.25rem', color: '#334155', fontWeight: 600 }}>{u.email}</td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                background: isSuperadminUser ? '#fef3c7' : u.role === 'admin' ? '#ecfdf5' : '#eff6ff',
                                color: isSuperadminUser ? '#92400e' : u.role === 'admin' ? '#047857' : '#1d4ed8',
                                border: isSuperadminUser ? '1px solid #fde68a' : u.role === 'admin' ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
                              }}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            {u.isApproved ? (
                              <span style={{ color: '#047857', fontWeight: 800, fontSize: '0.85rem' }}>✓ Active</span>
                            ) : (
                              <span style={{ color: '#b45309', fontWeight: 800, fontSize: '0.85rem' }}>⏳ Pending Approval</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            {isSuperadminUser ? (
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Protected (Superadmin)</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name, u.role)}
                                style={{
                                  backgroundColor: '#fef2f2',
                                  color: '#dc2626',
                                  fontWeight: 800,
                                  border: '1px solid #fecaca',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Delete Account & Remove Access"
                              >
                                <Trash2 size={14} /> Delete Account
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

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

      {/* Delete User Confirm Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmExecuteDeleteUser}
        title="Delete User Account"
        message={userToDelete ? `Are you sure you want to PERMANENTLY DELETE ${userToDelete.role.toUpperCase()} account '${userToDelete.name}'?` : ''}
        subMessage="Account and related records will be permanently removed."
        confirmText="Yes, Delete User"
        loading={isDeletingUser}
      />
    </div>
  );
};

export default AdminDashboard;
