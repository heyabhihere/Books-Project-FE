import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetToken } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(resetToken!, newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully! Please sign in.');
      navigate('/');
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Failed to reset password'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      toast.error('Invalid session. Please start over.');
      return navigate('/forgot-password');
    }
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    mutation.mutate();
  };

  return (
    <div className="auth-wrapper">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="auth-card">
        <div className="otp-icon-wrap">
          <ShieldCheck size={40} className="otp-shield" />
        </div>

        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Create a new password for your account. Make it strong!
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* New Password */}
          <div className="field-group">
            <label className="field-label">New Password</label>
            <div className="field-input-wrap">
              <Lock className="field-icon" size={18} />
              <input
                id="reset-new-password"
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="field-input"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="field-group">
            <label className="field-label">Confirm New Password</label>
            <div className="field-input-wrap">
              <Lock className="field-icon" size={18} />
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="field-input"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password match indicator */}
          {confirmPassword && (
            <p
              className="password-match-hint"
              style={{ color: newPassword === confirmPassword ? 'var(--success)' : 'var(--danger)' }}
            >
              {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          <button
            id="reset-submit-btn"
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? (
              <span className="spinner" />
            ) : (
              <>Reset Password <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <button
          className="resend-btn"
          onClick={() => navigate('/forgot-password')}
        >
          ← Start over
        </button>
      </div>
    </div>
  );
}
