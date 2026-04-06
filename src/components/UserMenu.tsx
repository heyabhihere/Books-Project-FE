import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import ReactDOM from 'react-dom';
import {
  User, LogOut, ChevronDown, X, Lock, Eye, EyeOff,
  Shield, Pencil, Check, Mail, Calendar, Venus, Mars, UserCircle2, Library
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const GENDER_MAP: Record<number, string> = { 1: 'Male', 2: 'Female', 3: 'Other' };

// ─── Profile Details Modal ────────────────────────────────────────────────────
function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [gender, setGender] = useState<number>(user?.gender ?? 0);
  const [dob, setDob] = useState(user?.DOB ? user.DOB.split('T')[0] : '');

  const mutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        name: name || undefined,
        gender: gender || undefined,
        DOB: dob || undefined,
      }),
    onSuccess: () => {
      setUser({ ...user!, name, gender: gender || undefined, DOB: dob || undefined });
      toast.success('Profile updated!');
      setEditing(false);
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Failed to update profile'),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card user-modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <UserCircle2 size={22} />
            <h2>Profile Details</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="user-modal-body">
          {/* Avatar */}
          <div className="profile-avatar-ring">
            <div className="profile-avatar-lg">
              <User size={36} />
            </div>
          </div>

          {/* Fields */}
          <div className="profile-fields">
            {/* Email — read-only */}
            <div className="profile-field">
              <span className="profile-field-label"><Mail size={14} /> Email</span>
              <span className="profile-field-value">{user?.email}</span>
            </div>

            {/* Name */}
            <div className="profile-field">
              <span className="profile-field-label"><User size={14} /> Name</span>
              {editing ? (
                <input
                  id="profile-name-input"
                  className="field-input profile-inline-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <span className="profile-field-value">{user?.name || '—'}</span>
              )}
            </div>

            {/* Gender */}
            <div className="profile-field">
              <span className="profile-field-label">
                {gender === 2 ? <Venus size={14} /> : <Mars size={14} />} Gender
              </span>
              {editing ? (
                <select
                  id="profile-gender-select"
                  className="field-input profile-inline-select"
                  value={gender}
                  onChange={(e) => setGender(Number(e.target.value))}
                >
                  <option value={0}>Select</option>
                  <option value={1}>Male</option>
                  <option value={2}>Female</option>
                  <option value={3}>Other</option>
                </select>
              ) : (
                <span className="profile-field-value">
                  {user?.gender ? GENDER_MAP[user.gender] : '—'}
                </span>
              )}
            </div>

            {/* DOB */}
            <div className="profile-field">
              <span className="profile-field-label"><Calendar size={14} /> Date of Birth</span>
              {editing ? (
                <input
                  id="profile-dob-input"
                  type="date"
                  className="field-input profile-inline-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              ) : (
                <span className="profile-field-value">
                  {user?.DOB ? new Date(user.DOB).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="user-modal-actions">
            {editing ? (
              <>
                <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                <button
                  id="profile-save-btn"
                  className="btn-primary"
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? <span className="spinner" /> : <><Check size={16} /> Save Changes</>}
                </button>
              </>
            ) : (
              <button
                id="profile-edit-btn"
                className="btn-primary"
                onClick={() => setEditing(true)}
              >
                <Pencil size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Modal ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword({ password: oldPassword, newPassword }),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Failed to change password'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    mutation.mutate();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card user-modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Shield size={22} />
            <h2>Change Password</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="user-modal-body">
          <div className="profile-fields">
            {/* Old Password */}
            <div className="profile-field vertical">
              <span className="profile-field-label"><Lock size={14} /> Current Password</span>
              <div className="field-input-wrap">
                <Lock className="field-icon" size={15} />
                <input
                  id="old-password-input"
                  type={showOld ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowOld(!showOld)} tabIndex={-1}>
                  {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="profile-field vertical">
              <span className="profile-field-label"><Lock size={14} /> New Password</span>
              <div className="field-input-wrap">
                <Lock className="field-icon" size={15} />
                <input
                  id="new-password-input"
                  type={showNew ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowNew(!showNew)} tabIndex={-1}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="profile-field vertical">
              <span className="profile-field-label"><Lock size={14} /> Confirm New Password</span>
              <div className="field-input-wrap">
                <Lock className="field-icon" size={15} />
                <input
                  id="confirm-password-input"
                  type={showConfirm ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="user-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button
              id="change-password-submit-btn"
              type="submit"
              className="btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <span className="spinner" /> : <><Shield size={16} /> Update Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── User Menu (Dropdown + Modals) ────────────────────────────────────────────
export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<'profile' | 'password' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const openModal = (m: 'profile' | 'password') => {
    setModal(m);
    setOpen(false);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="user-menu-root" ref={menuRef}>
        <button
          id="user-menu-trigger"
          className="user-menu-trigger"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <div className="user-avatar-trigger">{initials}</div>
          <span className="user-name-trigger">{displayName}</span>
          <ChevronDown size={15} className={`user-chevron ${open ? 'rotated' : ''}`} />
        </button>

        {open && (
          <div className="user-dropdown" role="menu">
            {/* User info header inside dropdown */}
            <div className="dropdown-user-info">
              <div className="dropdown-avatar">{initials}</div>
              <div>
                <p className="dropdown-name">{displayName}</p>
                <p className="dropdown-email">{user?.email}</p>
              </div>
            </div>

            <div className="dropdown-divider" />

            {location.pathname === '/' ? (
              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => { navigate('/home'); setOpen(false); }}
              >
                <Library size={16} />
                My Book Collection
              </button>
            ) : (
              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => { navigate('/'); setOpen(false); }}
              >
                <Library size={16} />
                Explore Books
              </button>
            )}

            <div className="dropdown-divider" />

            <button
              id="dropdown-profile-btn"
              className="dropdown-item"
              role="menuitem"
              onClick={() => openModal('profile')}
            >
              <UserCircle2 size={16} />
              Profile Details
            </button>

            <button
              id="dropdown-change-password-btn"
              className="dropdown-item"
              role="menuitem"
              onClick={() => openModal('password')}
            >
              <Shield size={16} />
              Change Password
            </button>

            <div className="dropdown-divider" />

            <button
              id="dropdown-logout-btn"
              className="dropdown-item dropdown-item-danger"
              role="menuitem"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Modals rendered into document.body to escape navbar stacking context */}
      {modal === 'profile' && ReactDOM.createPortal(
        <ProfileModal onClose={() => setModal(null)} />,
        document.body
      )}
      {modal === 'password' && ReactDOM.createPortal(
        <ChangePasswordModal onClose={() => setModal(null)} />,
        document.body
      )}
    </>
  );
}
