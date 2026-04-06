import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

// type=1 → signup OTP  |  type=2 → forgot-password OTP
export default function OtpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const otpType = searchParams.get('type') === '2' ? 2 : 1;
  const { pendingEmail, setAuth, setResetToken } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyOtp(pendingEmail!, otp.join(''), otpType),
    onSuccess: (data) => {
      if (otpType === 1) {
        // Signup flow — save auth and go to profile setup
        setAuth({ email: pendingEmail!, _id: data.user?._id || '' }, data.token);
        toast.success('Email verified! Complete your profile.');
        navigate('/home?setupProfile=true');
      } else {
        // Forgot-password flow — save the reset token and go to reset page
        setResetToken(data.resetToken);
        toast.success('OTP verified! Set your new password.');
        navigate('/reset-password');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp(pendingEmail!),
    onSuccess: () => toast.success('OTP resent!'),
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to resend OTP'),
  });

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length < 6) return toast.error('Enter all 6 digits');
    verifyMutation.mutate();
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="auth-wrapper">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="auth-card">
        <div className="otp-icon-wrap">
          <ShieldCheck size={40} className="otp-shield" />
        </div>

        <h1 className="auth-title">
          {otpType === 2 ? 'Verify your identity' : 'Verify your email'}
        </h1>
        <p className="auth-subtitle">
          {otpType === 2
            ? 'Enter the 6-digit code sent to reset your password'
            : "We've sent a 6-digit code to"}
        </p>
        <div className="otp-email-badge">
          <Mail size={14} />
          {pendingEmail}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-grid">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-input-${i}`}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`otp-input ${digit ? 'filled' : ''}`}
              />
            ))}
          </div>

          <button
            id="otp-verify-btn"
            type="submit"
            disabled={verifyMutation.isPending}
            className="btn-primary"
          >
            {verifyMutation.isPending ? (
              <span className="spinner" />
            ) : (
              <>Verify OTP <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <button
          id="otp-resend-btn"
          className="resend-btn"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
        >
          <RefreshCw size={14} className={resendMutation.isPending ? 'spin' : ''} />
          {resendMutation.isPending ? 'Sending...' : "Didn't receive it? Resend OTP"}
        </button>

        <button
          className="auth-switch-btn"
          style={{ marginTop: 8 }}
          onClick={() => navigate('/')}
        >
          ← Back to Sign In
        </button>
      </div>
    </div>
  );
}
