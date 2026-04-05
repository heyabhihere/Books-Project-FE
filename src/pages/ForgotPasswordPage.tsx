import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { setPendingEmail } = useAuthStore();
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: () => {
      setPendingEmail(email);
      toast.success('OTP sent to your email!');
      // Navigate to OTP page with type=2 for forgot-password flow
      navigate('/verify-otp?type=2');
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.error || 'Failed to send OTP'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="auth-wrapper">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="auth-card">
        <div className="otp-icon-wrap">
          <KeyRound size={40} className="otp-shield" />
        </div>

        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">
          Enter your email and we'll send you a verification code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">Email Address</label>
            <div className="field-input-wrap">
              <Mail className="field-icon" size={18} />
              <input
                id="forgot-email-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field-input"
              />
            </div>
          </div>

          <button
            id="forgot-submit-btn"
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? (
              <span className="spinner" />
            ) : (
              <>Send OTP <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <button
          id="forgot-back-btn"
          className="resend-btn"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
