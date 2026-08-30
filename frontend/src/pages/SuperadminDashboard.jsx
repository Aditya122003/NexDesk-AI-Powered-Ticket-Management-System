import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import TicketCard from '../components/TicketCard';
import TicketDetailModal from '../components/TicketDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import PriorityBadge from '../components/PriorityBadge';
import CategoryBadge from '../components/CategoryBadge';
import {
  Crown, Shield, Users, UserCheck, Ticket as TicketIcon, BarChart3, Search, RefreshCw,
  Trash2, CheckCircle, XCircle, Mail, AlertTriangle, Filter, Plus, Send, X,
  Download, LayoutGrid, List
} from 'lucide-react';

const SuperadminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'admins' | 'customers' | 'tickets'
  const [allUsers, setAllUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userToDeleteSilent, setUserToDeleteSilent] = useState(null);
  const [isDeletingSilent, setIsDeletingSilent] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ticketViewMode, setTicketViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Disapproval Modal State
  const [disapproveAdmin, setDisapproveAdmin] = useState(null);
  const [disapproveReason, setDisapproveReason] = useState('');
  const [disapproving, setDisapproving] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  // Fetch All System Users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setAllUsers(res.data.data);
      }
    } catch (error) {
      console.error('[Superadmin] Error fetching users:', error);
    }
  }, []);

  // Fetch Pending Admin Requests
  const fetchPendingAdmins = useCallback(async () => {
    try {
      const res = await API.get('/admin/pending-admins');
      if (res.data.success) {
        setPendingAdmins(res.data.data);
        // Automatically switch to 'pending' tab if pending requests exist and user is on default
        if (res.data.data.length > 0 && activeTab === 'admins') {
          setActiveTab('pending');
        }
      }
    } catch (error) {
      console.error('[Superadmin] Error fetching pending admins:', error);
    }
  }, []);

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 500,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: ticketSearch,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter
      };
      const res = await API.get('/tickets', { params });
      if (res.data.success) {
        const sortedTickets = (res.data.data || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setTickets(sortedTickets);
      }
    } catch (error) {
      console.error('[Superadmin] Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketSearch, statusFilter, priorityFilter, categoryFilter]);

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
    link.setAttribute('download', `Superadmin_Tickets_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported tickets list to CSV!', 'success');
  };

  const exportUsersToCSV = (roleFilter = null) => {
    const listToExport = roleFilter
      ? allUsers.filter(u => u.role === roleFilter)
      : allUsers;

    if (!listToExport || listToExport.length === 0) {
      showToast('No users available to export', 'info');
      return;
    }
    const headers = ['Name', 'Email', 'Role', 'Approval Status', 'Joined Date'];
    const rows = listToExport.map(u => [
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
    link.setAttribute('download', `Superadmin_Users_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported users list to CSV!', 'success');
  };

  const refreshAll = useCallback(() => {
    fetchUsers();
    fetchPendingAdmins();
    fetchTickets();
  }, [fetchUsers, fetchPendingAdmins, fetchTickets]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ACTION 1: Approve Admin Request (Sends Approval Email)
  const handleApproveAdmin = async (adminId, adminName, adminEmail) => {
    setApprovingId(adminId);
    try {
      const res = await API.put(`/admin/approve-admin/${adminId}`);
      if (res.data.success) {
        showToast(`Approved ${adminName} as Admin! Email notification sent to ${adminEmail}`, 'success');
        setPendingAdmins(prev => prev.filter(p => p._id !== adminId));
        refreshAll();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve admin', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  // ACTION 2: Submit Disapproval Modal with Reason (Sends Disapproval Email)
  const handleConfirmDisapprove = async (e) => {
    e.preventDefault();
    if (!disapproveReason.trim()) {
      showToast('Please enter a reason for disapproval', 'error');
      return;
    }

    setDisapproving(true);
    try {
      const res = await API.post(`/admin/reject-admin/${disapproveAdmin._id}`, {
        reason: disapproveReason.trim()
      });
      if (res.data.success) {
        showToast(`Disapproved ${disapproveAdmin.name}. Disapproval reason sent via email.`, 'info');
        setDisapproveAdmin(null);
        setDisapproveReason('');
        refreshAll();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to disapprove admin request', 'error');
    } finally {
      setDisapproving(false);
    }
  };

  // ACTION 3: Silent Delete User (No Email / Message Sent)
  const handleDeleteUserSilent = (userId, userName, userRole) => {
    setUserToDeleteSilent({ id: userId, name: userName, role: userRole });
  };

  const confirmExecuteDeleteUserSilent = async () => {
    if (!userToDeleteSilent) return;
    setIsDeletingSilent(true);
    try {
      const res = await API.delete(`/admin/users/${userToDeleteSilent.id}`);
      if (res.data.success) {
        showToast(`Account '${userToDeleteSilent.name}' deleted permanently without sending notifications.`, 'success');
        setUserToDeleteSilent(null);
        refreshAll();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeletingSilent(false);
    }
  };

  // Derived user lists
  const approvedAdmins = allUsers.filter(u => u.role === 'admin' && u.isApproved);
  const customerList = allUsers.filter(u => u.role === 'customer');

  const filteredPending = pendingAdmins.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredAdmins = approvedAdmins.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredCustomers = customerList.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

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
          gap: '1rem',
          backgroundColor: '#032d1f',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(3, 45, 31, 0.15)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <Crown size={28} style={{ color: '#a3e635' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Superadmin Control Center
            </h1>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.925rem', margin: 0 }}>
            Logged in as Superadmin: <strong style={{ color: '#a3e635' }}>{user?.email}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin/analytics')}
            style={{
              backgroundColor: '#a3e635',
              color: '#000000',
              fontWeight: 800,
              fontSize: '0.875rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart3 size={16} /> System Analytics
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        <div
          className="stat-card"
          onClick={() => setActiveTab('pending')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'pending' ? '2.5px solid #b45309' : '1.5px solid #e2e8f0',
            boxShadow: activeTab === 'pending' ? '0 8px 20px -4px rgba(180, 83, 9, 0.25)' : 'none',
            transform: activeTab === 'pending' ? 'translateY(-3px)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Pending Approvals</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309' }}>{pendingAdmins.length}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#b45309', background: 'rgba(180, 83, 9, 0.1)' }}>
            <UserCheck size={22} />
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setActiveTab('admins')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'admins' ? '2.5px solid #032d1f' : '1.5px solid #e2e8f0',
            boxShadow: activeTab === 'admins' ? '0 8px 20px -4px rgba(3, 45, 31, 0.25)' : 'none',
            transform: activeTab === 'admins' ? 'translateY(-3px)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Approved Admins</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#032d1f' }}>{approvedAdmins.length}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#032d1f', background: 'rgba(3, 45, 31, 0.1)' }}>
            <Shield size={22} />
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setActiveTab('customers')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'customers' ? '2.5px solid #047857' : '1.5px solid #e2e8f0',
            boxShadow: activeTab === 'customers' ? '0 8px 20px -4px rgba(4, 120, 87, 0.25)' : 'none',
            transform: activeTab === 'customers' ? 'translateY(-3px)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Total Customers</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857' }}>{customerList.length}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#047857', background: 'rgba(4, 120, 87, 0.1)' }}>
            <Users size={22} />
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => setActiveTab('tickets')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'tickets' ? '2.5px solid #1e40af' : '1.5px solid #e2e8f0',
            boxShadow: activeTab === 'tickets' ? '0 8px 20px -4px rgba(30, 64, 175, 0.25)' : 'none',
            transform: activeTab === 'tickets' ? 'translateY(-3px)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>Total System Tickets</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e40af' }}>{tickets.length}</div>
          </div>
          <div className="stat-icon-box" style={{ color: '#1e40af', background: 'rgba(30, 64, 175, 0.1)' }}>
            <Ticket size={22} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.75rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.85rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            backgroundColor: activeTab === 'pending' ? '#032d1f' : '#ffffff',
            color: activeTab === 'pending' ? '#a3e635' : '#475569',
            fontWeight: activeTab === 'pending' ? 900 : 700,
            fontSize: '0.875rem',
            padding: '0.65rem 1.35rem',
            borderRadius: '9999px',
            border: activeTab === 'pending' ? '2px solid #032d1f' : '1.5px solid #cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'pending'
              ? '0 6px 16px -2px rgba(3, 45, 31, 0.35), 0 0 0 3px rgba(163, 230, 53, 0.4)'
              : '0 2px 4px rgba(0, 0, 0, 0.03)',
            transform: activeTab === 'pending' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <UserCheck size={16} style={{ color: activeTab === 'pending' ? '#a3e635' : '#64748b' }} />
          Admin Approvals Tab ({pendingAdmins.length})
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          style={{
            backgroundColor: activeTab === 'admins' ? '#032d1f' : '#ffffff',
            color: activeTab === 'admins' ? '#a3e635' : '#475569',
            fontWeight: activeTab === 'admins' ? 900 : 700,
            fontSize: '0.875rem',
            padding: '0.65rem 1.35rem',
            borderRadius: '9999px',
            border: activeTab === 'admins' ? '2px solid #032d1f' : '1.5px solid #cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'admins'
              ? '0 6px 16px -2px rgba(3, 45, 31, 0.35), 0 0 0 3px rgba(163, 230, 53, 0.4)'
              : '0 2px 4px rgba(0, 0, 0, 0.03)',
            transform: activeTab === 'admins' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Shield size={16} style={{ color: activeTab === 'admins' ? '#a3e635' : '#64748b' }} />
          Approved Admins ({approvedAdmins.length})
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          style={{
            backgroundColor: activeTab === 'customers' ? '#032d1f' : '#ffffff',
            color: activeTab === 'customers' ? '#a3e635' : '#475569',
            fontWeight: activeTab === 'customers' ? 900 : 700,
            fontSize: '0.875rem',
            padding: '0.65rem 1.35rem',
            borderRadius: '9999px',
            border: activeTab === 'customers' ? '2px solid #032d1f' : '1.5px solid #cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'customers'
              ? '0 6px 16px -2px rgba(3, 45, 31, 0.35), 0 0 0 3px rgba(163, 230, 53, 0.4)'
              : '0 2px 4px rgba(0, 0, 0, 0.03)',
            transform: activeTab === 'customers' ? 'translateY(-2px)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Users size={16} style={{ color: activeTab === 'customers' ? '#a3e635' : '#64748b' }} />
          Manage Customers ({customerList.length})
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          style={{
            backgroundColor: activeTab === 'tickets' ? '#032d1f' : '#ffffff',
            color: activeTab === 'tickets' ? '#a3e635' : '#475569',
            fontWeight: activeTab === 'tickets' ? 900 : 700,
            fontSize: '0.875rem',
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
          <Ticket size={16} style={{ color: activeTab === 'tickets' ? '#a3e635' : '#64748b' }} />
          All System Tickets ({tickets.length})
        </button>
      </div>

      {/* TAB 1: ADMIN APPROVALS LIST (TABLE VIEW WITH ACTIONS: APPROVE / DISAPPROVE / DELETE) */}
      {activeTab === 'pending' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Pending Admin Approval Requests Directory
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Review registered admin applications. Approve access, disapprove with custom email reason, or permanently delete without sending message.
              </p>
            </div>
            <div style={{ width: '300px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search pending admin applications..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          {filteredPending.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle size={40} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
              <h4 style={{ color: '#0f172a', fontWeight: 800, margin: 0 }}>No Pending Admin Requests</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>All admin registration requests have been processed.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Admin Applicant</th>
                  <th style={{ padding: '1rem' }}>Email Address</th>
                  <th style={{ padding: '1rem' }}>Application Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Superadmin Governance Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((pAdmin) => (
                  <tr key={pAdmin._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={pAdmin.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pending'} alt="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1' }} />
                      <div>
                        <div>{pAdmin.name}</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Role: Admin Candidate</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#334155', fontWeight: 600 }}>{pAdmin.email}</td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                      {new Date(pAdmin.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                        ⏳ PENDING APPROVAL
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {/* APPROVE ACTION BUTTON */}
                        <button
                          onClick={() => handleApproveAdmin(pAdmin._id, pAdmin.name, pAdmin.email)}
                          disabled={approvingId === pAdmin._id}
                          style={{
                            backgroundColor: approvingId === pAdmin._id ? '#9ca3af' : '#10b981',
                            color: '#ffffff',
                            fontWeight: 800,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            cursor: approvingId === pAdmin._id ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            opacity: approvingId === pAdmin._id ? 0.7 : 1
                          }}
                          title="Approve Admin Role & Email Login Link"
                        >
                          <CheckCircle size={14} /> {approvingId === pAdmin._id ? 'Approving...' : 'Approve'}
                        </button>

                        {/* DISAPPROVE ACTION BUTTON (OPENS REASON MODAL) */}
                        <button
                          onClick={() => {
                            setDisapproveAdmin(pAdmin);
                            setDisapproveReason('');
                          }}
                          style={{
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            fontWeight: 800,
                            border: '1px solid #fde68a',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Disapprove Request & Email Specific Reason"
                        >
                          <XCircle size={14} /> Disapprove
                        </button>

                        {/* SILENT DELETE ACTION BUTTON (NO EMAIL SENT) */}
                        <button
                          onClick={() => handleDeleteUserSilent(pAdmin._id, pAdmin.name, 'Admin Request')}
                          style={{
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontWeight: 800,
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                          title="Permanently Delete (No Email / Message Sent)"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE APPROVED ADMINS */}
      {activeTab === 'admins' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Approved System Admin Directory
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '260px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search admin accounts..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
              <button
                type="button"
                onClick={() => exportUsersToCSV('admin')}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <Download size={15} /> Export CSV
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Admin Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Superadmin Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={admin.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    {admin.name}
                  </td>
                  <td style={{ padding: '1rem', color: '#334155', fontWeight: 600 }}>{admin.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                      ADMIN
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: '#047857', fontWeight: 800, fontSize: '0.85rem' }}>✓ Active & Approved</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteUserSilent(admin._id, admin.name, 'Admin')}
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
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} /> Delete Admin Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MANAGE CUSTOMERS */}
      {activeTab === 'customers' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Customer User Directory
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: '260px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search customers..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              </div>
              <button
                type="button"
                onClick={() => exportUsersToCSV('customer')}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <Download size={15} /> Export CSV
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Customer Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Superadmin Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={cust.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Customer'} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    {cust.name}
                  </td>
                  <td style={{ padding: '1rem', color: '#334155', fontWeight: 600 }}>{cust.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                      CUSTOMER
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteUserSilent(cust._id, cust.name, 'Customer')}
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
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} /> Delete Customer Account
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: TICKETS MANAGEMENT */}
      {activeTab === 'tickets' && (
        <>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search tickets by ID, title or customer..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>

            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
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
              style={{ width: '150px' }}
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
                fontSize: '0.85rem',
                fontWeight: 700
              }}
              title="Export Filtered Tickets to CSV"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>

          {tickets.length === 0 ? (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '4rem 2rem', textAlign: 'center' }}>
              <TicketIcon size={40} style={{ color: '#64748b', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                No Matching Tickets Found
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Try clearing or adjusting search filters.
              </p>
            </div>
          ) : ticketViewMode === 'grid' ? (
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
        </>
      )}

      {/* DISAPPROVAL REASON MODAL */}
      {disapproveAdmin && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '520px', padding: '2rem', backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={22} style={{ color: '#b45309' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Disapprove Admin Request
                </h3>
              </div>
              <button
                onClick={() => setDisapproveAdmin(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
              Enter the specific reason for disapproving <strong>{disapproveAdmin.name}</strong> ({disapproveAdmin.email}). This reason will be automatically sent to the applicant via email notification.
            </p>

            <form onSubmit={handleConfirmDisapprove}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#0f172a' }}>
                  Disapproval Reason (Sent via Email) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  required
                  placeholder="e.g. Work domain email required, or contact IT Administrator for verification."
                  value={disapproveReason}
                  onChange={(e) => setDisapproveReason(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDisapproveAdmin(null)}
                  className="btn btn-secondary"
                  disabled={disapproving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disapproving}
                  style={{
                    backgroundColor: '#b45309',
                    color: '#ffffff',
                    fontWeight: 800,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.625rem 1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={15} /> {disapproving ? 'Disapproving...' : 'Disapprove'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onTicketUpdated={(updated) => {
          setSelectedTicket(updated);
          fetchTickets();
        }}
      />

      {/* Silent Delete User Confirm Modal */}
      <ConfirmModal
        isOpen={!!userToDeleteSilent}
        onClose={() => setUserToDeleteSilent(null)}
        onConfirm={confirmExecuteDeleteUserSilent}
        title="Silent Delete Account"
        message={userToDeleteSilent ? `Are you sure you want to PERMANENTLY DELETE ${userToDeleteSilent.role.toUpperCase()} account '${userToDeleteSilent.name}'?` : ''}
        subMessage="Account & records will be removed immediately. NO EMAIL OR NOTIFICATION WILL BE SENT."
        confirmText="Yes, Silent Delete"
        loading={isDeletingSilent}
      />
    </div>
  );
};

export default SuperadminDashboard;
