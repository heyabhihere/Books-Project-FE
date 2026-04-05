import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import AuthPage from './pages/AuthPage';
import ExplorePage from './pages/ExplorePage';
import OtpPage from './pages/OtpPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ProtectedRoute, PublicRoute, OtpRoute, UpdateProfileRoute, ResetPasswordRoute } from './components/RouteGuards';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Explore page — truly public for all users */}
          <Route path="/" element={<ExplorePage />} />

          {/* Public routes — blocked for authenticated users (Auth pages) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* OTP — requires pendingEmail + not authenticated */}
          <Route element={<OtpRoute />}>
            <Route path="/verify-otp" element={<OtpPage />} />
          </Route>

          {/* Update profile — requires authentication */}
          <Route element={<UpdateProfileRoute />}>
            <Route path="/update-profile" element={<UpdateProfilePage />} />
          </Route>

          {/* Reset password — requires resetToken + not authenticated */}
          <Route element={<ResetPasswordRoute />}>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1e2e',
            color: '#cdd6f4',
            border: '1px solid rgba(137, 180, 250, 0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
          error: { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
