/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { User } from './types';
import { Role } from './types';
import { Navbar } from './components/organisms/Navbar';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { VerifyEmailPage } from './components/pages/VerifyEmailPage';
import { AdminUsers } from './components/pages/AdminUsers';
import { AdminExperiences } from './components/pages/AdminExperiences';
import { AdminProjects } from './components/pages/AdminProjects';
import { AdminProfile } from './components/pages/AdminProfile';
import { AdminDiagnostics } from './components/pages/AdminDiagnostics';
import { AdminDashboardOverview } from './components/pages/AdminDashboardOverview';
import { AdminExperienceDetail } from './components/pages/AdminExperienceDetail';
import { AdminProjectDetail } from './components/pages/AdminProjectDetail';
import { AdminLayout } from './components/templates/AdminLayout';
import { getSessionPayload, clearAccessToken } from './lib/auth';
import { initializeDB } from './utils/db';
import { Cpu } from 'lucide-react';
import { ProtectedLayout } from './components/templates/ProtectedLayout';
import { BusinessDashboard } from './components/pages/BusinessDashboard';
import { BusinessProfilePage } from './components/pages/BusinessProfile';
import { BusinessServices } from './components/pages/BusinessServices';
import { BusinessProjects } from './components/pages/BusinessProjects';
import { BusinessProjectDetail } from './components/pages/BusinessProjectDetail';

interface AppContentProps {
  currentUser: User | null;
  handleLoginSuccess: (user: User) => void;
  handleLogout: () => void;
}

function AppContent({ currentUser, handleLoginSuccess, handleLogout }: AppContentProps) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isVerifyEmailPage = location.pathname === '/verify-email';
  const isAuthPage = isLoginPage || isRegisterPage || isVerifyEmailPage;
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAdmin = currentUser?.role === Role.ADMIN;
  // Hide navbar/footer for ADMIN on admin pages (dark sidebar handles nav)
  const hideChrome = isAuthPage || (isAdminPage && isAdmin);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50/50">
      {/* Universal Navigation Header */}
      {!hideChrome && (
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Main Layout Area */}
      <main className="flex-1">
        <Routes>
          {/* Public Portfolio Showcase Hub */}
          <Route path="/" element={<LandingPage />} />

          {/* Login View */}
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate
                  to={
                    currentUser.role === Role.ADMIN
                      ? '/admin/dashboard'
                      : currentUser.businessProfile
                        ? '/admin/business/dashboard'
                        : '/admin/experiences'
                  }
                  replace
                />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Register View */}
          <Route
            path="/register"
            element={
              currentUser ? (
                <Navigate
                  to={
                    currentUser.role === Role.ADMIN
                      ? '/admin/dashboard'
                      : currentUser.businessProfile
                        ? '/admin/business/dashboard'
                        : '/admin/experiences'
                  }
                  replace
                />
              ) : (
                <RegisterPage onRegisterSuccess={handleLoginSuccess} />
              )
            }
          />

          {/* Verify Email View */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Secure Operational Admin Panel Workspace (Protected Layout) */}
          <Route element={<ProtectedLayout />}>
            <Route element={<AdminLayout currentUser={currentUser!} />}>
              {/* Default redirect inside admin */}
              <Route
                path="/admin"
                element={
                  <Navigate
                    to={
                      currentUser?.role === Role.ADMIN
                        ? '/admin/dashboard'
                        : currentUser?.businessProfile
                          ? '/admin/business/dashboard'
                          : '/admin/profile'
                    }
                    replace
                  />
                }
              />

              <Route path="/admin/dashboard" element={<AdminDashboardOverview />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/experiences" element={<AdminExperiences />} />
              <Route path="/admin/experiences/:id" element={<AdminExperienceDetail />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/projects/:id" element={<AdminProjectDetail />} />

              {/* Business Portfolio routes, restricted to BUSINESS role */}
              <Route
                path="/admin/business/dashboard"
                element={
                  currentUser?.businessProfile ? (
                    <BusinessDashboard />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />
              <Route
                path="/admin/business/profile"
                element={
                  currentUser?.businessProfile ? (
                    <BusinessProfilePage />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />
              <Route
                path="/admin/business/services"
                element={
                  currentUser?.businessProfile ? (
                    <BusinessServices />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />
              <Route
                path="/admin/business/projects"
                element={
                  currentUser?.businessProfile ? (
                    <BusinessProjects />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />
              <Route
                path="/admin/business/projects/:id"
                element={
                  currentUser?.businessProfile ? (
                    <BusinessProjectDetail />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />

              {/* Admin Users table restricted to ADMIN */}
              <Route
                path="/admin/users"
                element={
                  currentUser?.role === Role.ADMIN ? (
                    <AdminUsers />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />

              <Route path="/admin/diagnostics" element={<AdminDiagnostics />} />
            </Route>
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Modern High Contrast Footer */}
      {!hideChrome && (
        <footer className="border-t border-neutral-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="font-sans text-xs text-neutral-450">
                © {new Date().getFullYear()} AdminPortfolio Hub. Complete persistent sandbox directory.
              </span>
              <div className="flex items-center space-x-1 font-mono text-[10px] text-neutral-400">
                <Cpu className="h-3 w-3" />
                <span>SYSTEM COMPILED WITH VITE & TAILWIND v4</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  const [currentUser, setUserState] = useState<User | null>(() => {
    const payload = getSessionPayload();
    if (payload) {
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        businessProfile: payload.hasBusinessProfile ? {} as never : null,
        createdAt: '',
        updatedAt: '',
      };
    }
    return null;
  });

  // Initialize DB on mount
  useEffect(() => {
    initializeDB();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setUserState(user);
  };

  const handleLogout = () => {
    clearAccessToken();
    setUserState(null);
  };

  return (
    <BrowserRouter>
      <AppContent
        currentUser={currentUser}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
      />
    </BrowserRouter>
  );
}
