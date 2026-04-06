import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/** /home and other authenticated pages — redirect to / if not logged in */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

/** / (login/signup) — redirect to /home if already logged in */
export function PublicRoute() {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/home" replace />;
}

/**
 * /verify-otp — requires a pendingEmail in store AND must NOT be authenticated.
 * If authenticated → /home. If no pendingEmail → /.
 */
export function OtpRoute() {
  const { isAuthenticated, pendingEmail } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  if (!pendingEmail) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * /forgot-password — must NOT be authenticated.
 * Authenticated users go to /home.
 */
export function ForgotPasswordRoute() {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <Outlet /> : <Navigate to="/home" replace />;
}

/**
 * /reset-password — must NOT be authenticated AND must have a resetToken.
 * No token → back to forgot-password.
 */
export function ResetPasswordRoute() {
  const { isAuthenticated, resetToken } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/home" replace />;
  if (!resetToken) return <Navigate to="/forgot-password" replace />;
  return <Outlet />;
}
