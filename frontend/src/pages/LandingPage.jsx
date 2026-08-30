import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GoogleLogin } from '@react-oauth/google';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import AdminPendingModal from '../components/AdminPendingModal';
import NexDeskLogo from '../components/NexDeskLogo';
import {
  Sparkles, CheckCircle2, ArrowRight, Shield, Zap, Bot, Mail, Lock,
  LogIn, BarChart3, Users, Clock, ShieldCheck, HeartHandshake, ChevronRight,
  Globe, Phone, Star, Play, UserCheck, User, Loader2, AlertCircle
} from 'lucide-react';

const LandingPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const { user, login, googleLogin, logout, register } = useAuth();
  const { showToast } = useNotification();

  // Embedded Right-Side Auth Card Form State
  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'register'

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('customer');
  const [regLoading, setRegLoading] = useState(false);

  const [activeSection, setActiveSection] = useState('about');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isAdminPendingOpen, setIsAdminPendingOpen] = useState(false);
  const [pendingModalData, setPendingModalData] = useState({ name: '', email: '', message: '' });

  // Automatic Navbar ScrollSpy Highlight logic
  useEffect(() => {
    const sectionIds = ['about', 'features', 'workflow', 'governance'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220; // Header offset buffer

      let current = 'about';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        navigate(res.user.role === 'admin' || res.user.role === 'superadmin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      console.error('[LandingLogin] Error:', error);
      showToast(error.response?.data?.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin({ credential: credentialResponse.credential });
      if (res.success) {
        showToast(`Google Sign-In successful! Welcome ${res.user.name}`, 'success');
        navigate(res.user.role === 'admin' || res.user.role === 'superadmin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      console.error('[LandingGoogleLogin] Error:', error);
      showToast(error.response?.data?.message || 'Google authentication failed', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      showToast('Please fill out all fields', 'error');
      return;
    }
    if (regPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    if (!/[A-Z]/.test(regPassword)) {
      showToast('Password must contain at least 1 uppercase letter (A-Z)', 'error');
      return;
    }
    if (!/[a-z]/.test(regPassword)) {
      showToast('Password must contain at least 1 lowercase letter (a-z)', 'error');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(regPassword)) {
      showToast('Password must contain at least 1 special character (!@#$%^&*)', 'error');
      return;
    }

    setRegLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword, regRole);
      if (res.pendingApproval) {
        showToast(res.message || 'Admin registration submitted! Awaiting Superadmin approval.', 'info');
        setPendingModalData({
          name: regName,
          email: regEmail,
          message: res.message
        });
        setIsAdminPendingOpen(true);
        // Reset registration form
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegRole('customer');
      } else if (res.success) {
        showToast(`Account created successfully as ${regRole.toUpperCase()}!`, 'success');
        navigate(res.user.role === 'admin' || res.user.role === 'superadmin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      console.error('[Register] Error:', error);
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  const handleQuickDemoFill = (emailVal, passVal) => {
    setLoginEmail(emailVal);
    setLoginPassword(passVal);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>

      {/* Top Utility Announcement Bar */}
      <div style={{ backgroundColor: '#032d1f', color: '#ffffff', padding: '0.5rem 3rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <span style={{ backgroundColor: '#a3e635', color: '#000000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>NEW</span>
          ⚡ AI-Powered Smart Ticket Management System
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', opacity: 0.9 }}>
          <a href="tel:+919696591167" style={{ color: '#ffffff', textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}><Phone size={12} /> +91 9696591167</a>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={12} /> Global (English)</span>
        </div>
      </div>

      {/* NexDesk Corporate Header / Navigation */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 3rem',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          backgroundColor: '#ffffff',
          zIndex: 100,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <NexDeskLogo size="large" />
          </Link>

          <nav style={{ display: 'flex', gap: '0.5rem', fontWeight: 700, fontSize: '0.925rem' }}>
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); setActiveSection('about'); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`nav-link-animated ${activeSection === 'about' ? 'active' : ''}`}
            >
              About Platform
            </a>
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); setActiveSection('features'); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`nav-link-animated ${activeSection === 'features' ? 'active' : ''}`}
            >
              AI Features
            </a>
            <a
              href="#workflow"
              onClick={(e) => { e.preventDefault(); setActiveSection('workflow'); document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`nav-link-animated ${activeSection === 'workflow' ? 'active' : ''}`}
            >
              How It Works
            </a>
            <a
              href="#governance"
              onClick={(e) => { e.preventDefault(); setActiveSection('governance'); document.getElementById('governance')?.scrollIntoView({ behavior: 'smooth' }); }}
              className={`nav-link-animated ${activeSection === 'governance' ? 'active' : ''}`}
            >
              Security
            </a>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <button
              onClick={() => navigate(user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/dashboard')}
              style={{
                backgroundColor: '#032d1f',
                color: '#a3e635',
                fontWeight: 800,
                fontSize: '0.875rem',
                padding: '0.625rem 1.35rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Open Workspace Dashboard &rarr;
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthMode('register');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                backgroundColor: '#a3e635',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.875rem',
                padding: '0.625rem 1.35rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(163, 230, 53, 0.4)'
              }}
            >
              Create Account
            </button>
          )}
        </div>
      </header>

      {/* HERO SECTION WITH EMBEDDED RIGHT-SIDE LOGIN CARD */}
      <section
        style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '4rem 0'
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 3rem',
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '4rem',
            alignItems: 'center'
          }}
        >
        {/* LEFT COLUMN: HERO HEADING & FEATURES */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#032d1f',
              marginBottom: '1.25rem',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <Sparkles size={14} style={{ color: '#032d1f' }} /> ENTERPRISE HELPDESK TICKETING SOFTWARE
          </div>

          <h1 style={{ fontSize: '3.6rem', fontWeight: 800, color: '#000000', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            AI-powered<br />ticketing system for<br />modern teams.
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '540px' }}>
            NexDesk Ticketing brings Groq LLM auto-triage, multi-channel support, role-based workflows, and real-time governance into one intuitive system.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} /> Automatic ticket classification powered by Groq SDK
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} /> Superadmin governance & email notification workflow
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} /> Instant workspace login & self-registration access
            </div>
          </div>

          {/* Customer Reviews Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', color: '#f59e0b' }}>
              <Star size={18} fill="#f59e0b" />
              <Star size={18} fill="#f59e0b" />
              <Star size={18} fill="#f59e0b" />
              <Star size={18} fill="#f59e0b" />
              <Star size={18} fill="#f59e0b" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>
              Rated 4.9/5 by 5,000+ support teams worldwide
            </span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.16), 0 8px 20px -4px rgba(15, 23, 42, 0.08)',
            border: '2px solid #cbd5e1',
            borderTop: '5px solid #032d1f',
            position: 'relative'
          }}
        >
          {user ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <UserCheck size={32} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                You're Signed In!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.5rem' }}>
                Logged in as <strong>{user.name}</strong> ({user.email})<br />
                Role: <span style={{ fontWeight: 800, color: '#032d1f' }}>{user.role.toUpperCase()}</span>
              </p>
              <button
                onClick={() => navigate(user.role === 'admin' || user.role === 'superadmin' ? '/admin' : '/dashboard')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginBottom: '0.75rem' }}
              >
                Go to Workspace Dashboard &rarr;
              </button>
              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
              >
                Switch Account / Sign Out
              </button>
            </div>
          ) : (
            <>
              {/* DUAL MODE TAB SWITCHER: SIGN IN / CREATE ACCOUNT */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  backgroundColor: '#f1f5f9',
                  padding: '5px',
                  borderRadius: '16px',
                  marginBottom: '1.75rem',
                  border: '1.5px solid #cbd5e1'
                }}
              >
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'login' ? '#032d1f' : 'transparent',
                    color: authMode === 'login' ? '#a3e635' : '#64748b',
                    boxShadow: authMode === 'login' ? '0 4px 12px rgba(3, 45, 31, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <LogIn size={15} /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'register' ? '#032d1f' : 'transparent',
                    color: authMode === 'register' ? '#a3e635' : '#64748b',
                    boxShadow: authMode === 'register' ? '0 4px 12px rgba(3, 45, 31, 0.25)' : 'none',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <User size={15} /> Create Account
                </button>
              </div>

              {authMode === 'login' ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                      Sign In to Your Workspace
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Access Customer, Admin, or Superadmin Dashboard
                    </p>
                  </div>

                  {/* Embedded Google OAuth Login */}
                  <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => showToast('Google Login Failed', 'error')}
                      shape="pill"
                      theme="outline"
                      size="large"
                      width="320px"
                      text="continue_with"
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#cbd5e1' }}></div>
                    <span style={{ padding: '0 10px', fontWeight: 700, color: '#64748b' }}>OR LOGIN WITH EMAIL</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#cbd5e1' }}></div>
                  </div>

                  <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          style={{ paddingLeft: '2.5rem' }}
                          required
                        />
                        <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>Password</label>
                        <button
                          type="button"
                          onClick={() => setIsForgotOpen(true)}
                          style={{ background: 'none', border: 'none', color: '#032d1f', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          style={{ paddingLeft: '2.5rem' }}
                          required
                        />
                        <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
                    >
                      {loginLoading ? 'Signing In...' : <>Sign In to Account <ArrowRight size={16} /></>}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      style={{ background: 'none', border: 'none', color: '#032d1f', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Register Free
                    </button>
                  </div>
                </>
              ) : (
                /* REGISTRATION FORM MODE */
                <>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                      Create Your Account
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Join NexDesk support platform in seconds
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Aditya Tiwari"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
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
                          placeholder="name@example.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
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
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          style={{ paddingLeft: '2.5rem' }}
                          required
                          minLength={8}
                        />
                        <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Account Role</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setRegRole('customer')}
                          style={{
                            padding: '10px',
                            borderRadius: '12px',
                            border: regRole === 'customer' ? '2px solid #032d1f' : '1.5px solid #cbd5e1',
                            backgroundColor: regRole === 'customer' ? '#a3e635' : '#ffffff',
                            color: regRole === 'customer' ? '#000000' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <User size={15} /> Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('admin')}
                          style={{
                            padding: '10px',
                            borderRadius: '12px',
                            border: regRole === 'admin' ? '2px solid #032d1f' : '1.5px solid #cbd5e1',
                            backgroundColor: regRole === 'admin' ? '#032d1f' : '#ffffff',
                            color: regRole === 'admin' ? '#a3e635' : '#475569',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Shield size={15} /> Admin
                        </button>
                      </div>
                    </div>

                    {regRole === 'admin' && (
                      <div
                        style={{
                          backgroundColor: '#fffbeb',
                          border: '1.5px solid #fde68a',
                          borderRadius: '12px',
                          padding: '0.85rem',
                          fontSize: '0.8rem',
                          color: '#b45309',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}
                      >
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
                        <div>
                          <strong>Superadmin Approval Required:</strong> Admin requests require review by Superadmin before access is activated.
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
                    >
                      {regLoading ? <Loader2 size={18} className="spin" /> : <>Complete Registration <ArrowRight size={16} /></>}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      style={{ background: 'none', border: 'none', color: '#032d1f', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Sign In
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        </div>

      </section>

      {/* SECTION 2: ABOUT & STATS METRICS */}
      <section id="about" style={{ backgroundColor: '#f8fafc', padding: '5rem 3rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Built for High-Performance Support Engineering
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            Designed to bridge customer requests with instant Groq LLM intelligence, status progression tracking, and complete Superadmin security governance.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#032d1f', marginBottom: '0.25rem' }}>10x</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Faster Ticket Triage</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Groq AI categorizes tickets in under 500ms using Llama-3 70B.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#a3e635', backgroundColor: '#032d1f', display: 'inline-block', padding: '0 12px', borderRadius: '8px', marginBottom: '0.25rem' }}>99.9%</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Service Availability</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Production MongoDB aggregation pipeline ensures zero downtime.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#032d1f', marginBottom: '0.25rem' }}>100%</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Superadmin Control</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Strict role validation protects system integrity & user accounts.</p>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#2563eb', marginBottom: '0.25rem' }}>Instant</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Email Notifications</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Automated Nodemailer notifications dispatched upon status changes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2.5: HUMAN & AI HYBRID SUPPORT SHOWCASE (MATCHING USER REFERENCE IMAGE) */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: '4rem', alignItems: 'center' }}>

          {/* LEFT CONTENT */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ecfdf5',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#047857',
                marginBottom: '1.25rem',
                border: '1px solid #a7f3d0'
              }}
            >
              <Sparkles size={14} style={{ color: '#047857' }} /> HYBRID SUPPORT & AI ASSISTANCE
            </div>

            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Empower support agents with instant Groq AI intelligence.
            </h2>

            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>
              When customers submit inquiries, NexDesk instantly suggests accurate responses, analyzes ticket issue details, and streamlines complex workflows so your team resolves tickets in seconds.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} /> Real-time issue resolution & order status verification
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} /> Automatic priority escalation & response time warnings
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} /> Seamless team collaboration & superadmin governance
              </div>
            </div>

            <a
              href="tel:+919696591167"
              style={{
                backgroundColor: '#a3e635',
                color: '#000000',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '0.85rem 2rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(163, 230, 53, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              <Phone size={18} /> Call +91 9696591167
            </a>
          </div>

          {/* RIGHT COLUMN: PHOTO SHOWCASE WITH FLOATING CHAT BUBBLES (EXACT REFERENCE IMAGE MATCH) */}
          <div style={{ position: 'relative' }}>
            {/* Background Accent Card Container */}
            <div
              style={{
                position: 'relative',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)',
                border: '4px solid #ffffff',
                maxHeight: '560px'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop"
                alt="Customer Support Representative"
                style={{
                  width: '100%',
                  height: '560px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* FLOATING CHAT BUBBLE 1 (TOP LEFT - CUSTOMER REQUEST) */}
            <div
              style={{
                position: 'absolute',
                top: '30px',
                left: '-35px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                zIndex: 10,
                maxWidth: '310px'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop"
                alt="Joe Avatar"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '2px solid #ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  flexShrink: 0
                }}
              />
              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  padding: '14px 18px',
                  borderRadius: '18px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                  fontSize: '0.925rem',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  border: '1px solid #f1f5f9'
                }}
              >
                I want a refund for my order number #9213.
              </div>
            </div>

            {/* FLOATING CHAT BUBBLE 2 (MIDDLE LEFT - AGENT RESPONSE) */}
            <div
              style={{
                position: 'absolute',
                top: '120px',
                left: '10px',
                zIndex: 10,
                maxWidth: '320px'
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  padding: '16px 20px',
                  borderRadius: '20px',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.18)',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  lineHeight: 1.45,
                  border: '1px solid #f1f5f9'
                }}
              >
                Hi Joe, I'm processing your refund. Is there anything else I can help you with?
              </div>
            </div>

            {/* FLOATING LIME BADGE (BOTTOM RIGHT - CONTACT SALES) */}
            <div
              style={{
                position: 'absolute',
                bottom: '25px',
                right: '-15px',
                zIndex: 10
              }}
            >
              <a
                href="tel:+919696591167"
                style={{
                  backgroundColor: '#a3e635',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(163, 230, 53, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <Phone size={18} fill="#000000" /> +91 9696591167
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: KEY FEATURES SHOWCASE */}
      <section id="features" style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#032d1f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            ENTERPRISE CAPABILITIES
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>
            Everything you need to deliver world-class support
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {/* Feature 1 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              ⚡ Groq LLM Auto-Triage
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Automatically analyzes ticket titles and descriptions, accurately assigning priority levels (Urgent, High, Medium, Low) and categories in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              👑 Superadmin Security & Approval
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Admins require Superadmin approval before gaining access. Superadmin can approve or delete any admin/customer account with 1-click.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              📊 Interactive Recharts Analytics
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Visual analytics charts displaying status breakdown, priority metrics, category distribution, and resolution velocity timelines.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS WORKFLOW */}
      <section id="workflow" style={{ backgroundColor: '#032d1f', color: '#ffffff', padding: '5rem 3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              SEAMLESS WORKFLOW
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
              How NexDesk Helpdesk Automates Support
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#a3e635', color: '#000000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>1</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Submit Support Request</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>Customer creates a ticket with optional file attachments (images, PDFs, documents up to 5MB).</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#a3e635', color: '#000000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>2</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Groq AI Classification</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>Groq SDK analyzes problem severity and auto-assigns category and priority level.</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#a3e635', color: '#000000', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>3</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Resolution & Email Alert</h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>Admin updates ticket status (In Progress &rarr; Resolved). Customer receives instant email notification.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SECURITY & GOVERNANCE (LINKED TO NAVBAR SECURITY BUTTON) */}
      <section id="governance" style={{ maxWidth: '1280px', margin: '0 auto', padding: '5rem 3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#047857',
              marginBottom: '1rem',
              border: '1px solid #a7f3d0'
            }}
          >
            <ShieldCheck size={14} style={{ color: '#047857' }} /> ENTERPRISE GOVERNANCE & SECURITY
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Role Based Access Control
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '680px', margin: '0 auto' }}>
            NexDesk protects system data and user privileges through multi-tier RBAC, automated Superadmin approvals, and encrypted sessions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {/* Security Card 1 */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Role-Based Access Control (RBAC)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              Granular access levels for Customers, Admins, and Superadmins. Every API endpoint enforces strict JWT middleware token verification.
            </p>
          </div>

          {/* Security Card 2 */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <UserCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Superadmin Approval Engine
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              New Admin accounts require Superadmin approval before gaining admin rights. Rejections send custom disapproval reasons via email.
            </p>
          </div>

          {/* Security Card 3 */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Bcrypt & TLS Encryption
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              All user passwords are salted and hashed using Bcrypt. Data in transit is protected using SSL/TLS encryption.
            </p>
          </div>

          {/* Security Card 4 */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Audit History & Response Time Alerts
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              Timestamped status history for every ticket provides complete audit trails. Automated Nodemailer notifications alert users on ticket updates.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#070b14', color: '#94a3b8', padding: '5rem 3rem 2rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Top 4-Column Footer Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '3rem',
              marginBottom: '4rem'
            }}
          >
            {/* Column 1: Brand Info */}
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <NexDeskLogo size="medium" light={true} />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Next-generation AI helpdesk & ticket governance platform powered by Groq Llama-3, real-time analytics, and Superadmin control.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#a3e635', fontWeight: 800 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a3e635', display: 'inline-block' }}></span>
                System Operational • Node v20 / Mongo Active
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                Platform
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <li><a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>AI Auto-Triage Engine</a></li>
                <li><a href="#governance" style={{ color: '#94a3b8', textDecoration: 'none' }}>Enterprise Security</a></li>
                <li><a href="#workflow" style={{ color: '#94a3b8', textDecoration: 'none' }}>Resolution Workflow</a></li>
                <li><a href="#about" style={{ color: '#94a3b8', textDecoration: 'none' }}>Support Performance</a></li>
              </ul>
            </div>

            {/* Column 3: Contact & Support */}
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                Contact & Support
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} style={{ color: '#a3e635' }} />
                  <a href="tel:+919696591167" style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>+91 9696591167</a>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} style={{ color: '#38bdf8' }} />
                  <a href="mailto:adityatiwari5175@gmail.com" style={{ color: '#cbd5e1', textDecoration: 'none' }}>adityatiwari5175@gmail.com</a>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                  <ShieldCheck size={15} style={{ color: '#10b981' }} /> Superadmin Security Verified
                </li>
              </ul>
            </div>

            {/* Column 4: Lead Engineer & Developer Card */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a3e635', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                LEAD ARCHITECT & DEVELOPER
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem' }}>
                Developed by Aditya Tiwari
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1rem' }}>
                Crafted with full-stack React, Express, MongoDB, and Groq LLM integration for enterprise-grade performance.
              </p>
              <a
                href="mailto:adityatiwari5175@gmail.com"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#a3e635',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none'
                }}
              >
                <Mail size={13} /> Contact Aditya
              </a>
            </div>
          </div>

          {/* Bottom Footer Bar */}
          <div
            style={{
              borderTop: '1px solid #1e293b',
              paddingTop: '2rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.85rem'
            }}
          >
            <div>
              © 2026 NexDesk Support Platform. All Rights Reserved.
            </div>

            <div style={{ fontWeight: 800, color: '#ffffff' }}>
              Developed by <span style={{ color: '#a3e635', fontWeight: 900, fontSize: '0.95rem' }}>Aditya Tiwari</span>
            </div>

          </div>
        </div>
      </footer>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
      <AdminPendingModal
        isOpen={isAdminPendingOpen}
        onClose={() => {
          setIsAdminPendingOpen(false);
          setAuthMode('login');
        }}
        userName={pendingModalData.name}
        userEmail={pendingModalData.email}
        message={pendingModalData.message}
      />
    </div>
  );
};

export default LandingPage;
