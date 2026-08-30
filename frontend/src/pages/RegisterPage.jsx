import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import AdminPendingModal from '../components/AdminPendingModal';
import { Sparkles, User, Mail, Lock, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);

  const [isAdminPendingOpen, setIsAdminPendingOpen] = useState(false);
  const [pendingModalData, setPendingModalData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill out all fields', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      showToast('Password must contain at least 1 uppercase letter (A-Z)', 'error');
      return;
    }
    if (!/[a-z]/.test(password)) {
      showToast('Password must contain at least 1 lowercase letter (a-z)', 'error');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      showToast('Password must contain at least 1 special character (!@#$%^&*)', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, role);
      if (res.pendingApproval) {
        showToast(res.message || 'Admin registration submitted! Awaiting Superadmin approval.', 'info');
        setPendingModalData({
          name,
          email,
          message: res.message
        });
        setIsAdminPendingOpen(true);
        // Reset form fields
        setName('');
        setEmail('');
        setPassword('');
        setRole('customer');
      } else if (res.success) {
        showToast(`Account created successfully as ${role.toUpperCase()}!`, 'success');
        navigate(res.user.role === 'admin' || res.user.role === 'superadmin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      console.error('[Register] Error:', error);
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, #0b0f19 70%)',
        padding: '1.5rem'
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '450px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--border-color-glow)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              padding: '10px 18px',
              borderRadius: '14px',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={22} /> NexDesk Helpdesk
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Join NexDesk helpdesk platform
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <User size={14} /> Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem' }}
              >
                <Shield size={14} /> Admin
              </button>
            </div>
          </div>

          {role === 'admin' && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.8rem',
                color: '#fbbf24',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Superadmin Approval Required:</strong> Admin accounts require approval from Superadmin (<code>adityatiwari5175@gmail.com</code>) before login access is granted.
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? <Loader2 size={18} className="spin" /> : <>Complete Registration <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>

      <AdminPendingModal
        isOpen={isAdminPendingOpen}
        onClose={() => {
          setIsAdminPendingOpen(false);
          navigate('/login');
        }}
        userName={pendingModalData.name}
        userEmail={pendingModalData.email}
        message={pendingModalData.message}
      />
    </div>
  );
};

export default RegisterPage;
