import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, BookOpen, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, setPendingEmail } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Welcome back!');
      navigate('/home');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: () => authApi.register(email, password),
    onSuccess: () => {
      setPendingEmail(email);
      toast.success('OTP sent to your email!');
      navigate('/verify-otp');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Registration failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') loginMutation.mutate();
    else registerMutation.mutate();
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="auth-wrapper">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">
            <BookOpen size={28} />
          </div>
          <span className="logo-text">BookVault</span>
          <Sparkles className="sparkle" size={16} />
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to manage your library'
            : 'Join BookVault today'}
        </p>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
          <div className={`tab-slider ${mode === 'signup' ? 'right' : ''}`} />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label">Email</label>
            <div className="field-input-wrap">
              <Mail className="field-icon" size={18} />
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field-input"
              />
            </div>
          </div>

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="field-input-wrap">
              <Lock className="field-icon" size={18} />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field-input"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-switch-btn"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
