import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { X, User, Mail, Shield, Upload, Sparkles, Check, Camera } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  // Handle local file upload (converts image to Base64 data URL)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate random DiceBear Avatar
  const handleGenerateAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setAvatar(newAvatarUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await API.put('/auth/profile', {
        name: name.trim(),
        avatar
      });

      if (res.data.success) {
        updateUser(res.data.user, res.data.token);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('[ProfileModal] Save error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '8px', borderRadius: '12px' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                My Account Profile
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                Update your personal information & profile picture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem'
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Check size={16} /> {successMsg}
            </div>
          )}

          {/* Avatar Profile Picture Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <img
                src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                alt={name}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #a3e635',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}
              />
              <label
                htmlFor="avatar-file-input"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  backgroundColor: '#032d1f',
                  color: '#a3e635',
                  borderRadius: '50%',
                  padding: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Upload Photo from Computer"
              >
                <Camera size={15} />
              </label>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Avatar Action Controls */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <label
                htmlFor="avatar-file-input"
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #cbd5e1'
                }}
              >
                <Upload size={13} /> Upload Photo
              </label>
              <button
                type="button"
                onClick={handleGenerateAvatar}
                style={{
                  backgroundColor: '#f3e8ff',
                  color: '#7e22ce',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #d8b4fe'
                }}
              >
                <Sparkles size={13} /> AI Avatar
              </button>
            </div>
          </div>

          {/* Form Field 1: Full Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Form Field 2: Email Address (Read-only) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
              Email Address <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>(Cannot be changed)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={user.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#64748b',
                  cursor: 'not-allowed'
                }}
              />
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {/* Form Field 3: User Role Badge */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
              Account Permission Level
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: user.role === 'superadmin' ? '#dcfce7' : user.role === 'admin' ? '#eff6ff' : '#f1f5f9',
                  color: user.role === 'superadmin' ? '#15803d' : user.role === 'admin' ? '#1d4ed8' : '#334155',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  border: '1px solid #cbd5e1'
                }}
              >
                <Shield size={14} /> {user.role}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#032d1f',
                color: '#a3e635',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
