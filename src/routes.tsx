import { Routes, Route, Navigate } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage';
import AuthPage from './pages/AuthPage';
import OtpPage from './pages/OtpPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ProtectedRoute, PublicRoute, OtpRoute, UpdateProfileRoute, ResetPasswordRoute } from './components/RouteGuards';

export default function AppRoutes() {
    return (
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
    );
}