/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import type { User } from './types';
import { Role } from './types';
import { Navbar } from './components/organisms/Navbar';
import { BrandLogo } from './components/atoms/BrandLogo';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { VerifyEmailPage } from './components/pages/VerifyEmailPage';
import { VerificationRequiredPage } from './components/pages/VerificationRequiredPage';
import { AdminUsers } from './components/pages/AdminUsers';
import { AdminExperiences } from './components/pages/AdminExperiences';
import { AdminProjects } from './components/pages/AdminProjects';
import { AdminProfile } from './components/pages/AdminProfile';
import { AdminDiagnostics } from './components/pages/AdminDiagnostics';
import { AdminDashboardOverview } from './components/pages/AdminDashboardOverview';
import { AdminExperienceDetail } from './components/pages/AdminExperienceDetail';
import { AdminProjectDetail } from './components/pages/AdminProjectDetail';
import { AdminLayout } from './components/templates/AdminLayout';
import { getSessionPayload, clearAccessToken, getAccessToken } from './lib/auth';
import { api } from './lib/api';
import { initializeDB } from './utils/db';
import { ProtectedLayout } from './components/templates/ProtectedLayout';
import { BusinessDashboard } from './components/pages/BusinessDashboard';
import { BusinessProfilePage } from './components/pages/BusinessProfile';
import { BusinessServices } from './components/pages/BusinessServices';
import { BusinessProjects } from './components/pages/BusinessProjects';
import { BusinessProjectDetail } from './components/pages/BusinessProjectDetail';
import { AdminTemplates } from './components/pages/AdminTemplates';
import { AdminTemplateBuilder } from './components/pages/AdminTemplateBuilder';
import { PublicPortfolioPage } from './components/pages/PublicPortfolioPage';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { UserThemeStudio } from './components/pages/UserThemeStudio';
import { UserDashboard } from './components/pages/UserDashboard';
import { ActivateBusinessPage } from './components/pages/ActivateBusinessPage';
import { ToastProvider } from './context/ToastContext';

interface AppContentProps {
  currentUser: User | null;
  handleLoginSuccess: (user: User) => void;
  handleLogout: () => void;
}

function AppContent({ currentUser, handleLoginSuccess, handleLogout }: AppContentProps) {
  const location = useLocation();
  const token = getAccessToken();
  const session = getSessionPayload();
  const isAuthenticated = !!currentUser && !!token && !!session;

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isVerifyEmailPage = location.pathname === '/verify-email';
  const isForgotPwPage = location.pathname === '/forgot-password';
  const isResetPwPage = location.pathname === '/reset-password';
  const isPortfolioPage = location.pathname.startsWith('/portfolio');
  const isBuilderPage = location.pathname.startsWith('/admin/templates/builder');
  const isStudioPage = location.pathname.includes('/theme-studio');
  const isAuthPage = isLoginPage || isRegisterPage || isVerifyEmailPage || isForgotPwPage || isResetPwPage;
  const isAdminPage = location.pathname.startsWith('/admin');
  // Hide public navbar and footer for AUTH, PORTFOLIO, BUILDER STUDIO, USER THEME STUDIO, and all /admin workspace pages
  const hideChrome = isAuthPage || isPortfolioPage || isBuilderPage || isStudioPage || isAdminPage;

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#202744]">
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
          <Route path="/portfolio/:userId" element={<PublicPortfolioPage />} />

          {/* Login View */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to={
                    currentUser!.role === Role.ADMIN
                      ? '/admin/dashboard'
                      : currentUser!.businessProfile
                        ? '/admin/business/dashboard'
                        : '/admin/dashboard'
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
              isAuthenticated ? (
                <Navigate
                  to={
                    currentUser!.role === Role.ADMIN
                      ? '/admin/dashboard'
                      : currentUser!.businessProfile
                        ? '/admin/business/dashboard'
                        : '/admin/dashboard'
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
          <Route path="/verify-required" element={<VerificationRequiredPage />} />

          {/* Forgot / Reset Password Views */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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
                          : '/admin/dashboard'
                    }
                    replace
                  />
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  currentUser?.role === Role.ADMIN ? (
                    <AdminDashboardOverview />
                  ) : (
                    <UserDashboard currentUser={currentUser!} />
                  )
                }
              />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/admin/theme-studio" element={<UserThemeStudio currentUser={currentUser!} />} />
              <Route path="/admin/experiences" element={<AdminExperiences />} />
              <Route path="/admin/experiences/:id" element={<AdminExperienceDetail />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/projects/:id" element={<AdminProjectDetail />} />

              {/* Business Profile Activation / Onboarding Page */}
              <Route
                path="/admin/business/activate"
                element={<ActivateBusinessPage currentUser={currentUser!} />}
              />

              {/* Business Portfolio routes, restricted to users with active businessProfile */}
              <Route
                path="/admin/business/dashboard"
                element={
                  currentUser?.businessProfile ? (
                    <BusinessDashboard />
                  ) : (
                    <Navigate to="/admin/business/activate" replace />
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
                path="/admin/business/theme-studio"
                element={
                  currentUser?.businessProfile ? (
                    <UserThemeStudio currentUser={currentUser!} isBusinessMode />
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

              {/* Admin Templates Management & Builder Studio */}
              <Route
                path="/admin/templates"
                element={
                  currentUser?.role === Role.ADMIN ? (
                    <AdminTemplates />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />
              <Route
                path="/admin/templates/builder"
                element={
                  currentUser?.role === Role.ADMIN ? (
                    <AdminTemplateBuilder />
                  ) : (
                    <Navigate to="/admin/profile" replace />
                  )
                }
              />
              <Route
                path="/admin/templates/builder/:id"
                element={
                  currentUser?.role === Role.ADMIN ? (
                    <AdminTemplateBuilder />
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

      {/* Brand High Polish Footer */}
      {!hideChrome && (
        <footer className="border-t border-[#EAE5DD] bg-white py-12 text-[#69718A]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#F0EBE3]">
              <div className="flex flex-col items-center md:items-start">
                <BrandLogo size="md" showTagline={true} />
                <p className="mt-2 text-xs text-[#69718A] max-w-sm text-center md:text-left">
                  Rumah untuk identitas profesional, portofolio kreatif, dan showcase bisnismu.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#69718A]">
                <a href="#features" className="hover:text-[#202744] transition-colors">Fitur</a>
                <a href="#audiences" className="hover:text-[#202744] transition-colors">Untuk Siapa</a>
                <a href="#templates" className="hover:text-[#202744] transition-colors">Tema</a>
                <a href="#faq" className="hover:text-[#202744] transition-colors">Tanya Jawab</a>
                <Link to="/login" className="hover:text-[#8B6CF6] transition-colors">Masuk</Link>
                <Link to="/register" className="text-[#8B6CF6] hover:text-[#7A56F4] font-bold transition-colors">Mulai Gratis</Link>
              </div>
            </div>
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#69718A]">
              <span>
                © {new Date().getFullYear()} foliowalaweh. Hak cipta dilindungi.
              </span>
              <div className="flex items-center space-x-2 text-[11px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Platform ganda: Portofolio Personal & Showcase Komersial</span>
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
      const hasStoredBusiness = localStorage.getItem('has_business_profile') === 'true';
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        businessProfile: (payload.hasBusinessProfile || hasStoredBusiness) ? {} as never : null,
        createdAt: '',
        updatedAt: '',
      };
    }
    return null;
  });

  // Initialize DB on mount and sync user info from /auth/me
  useEffect(() => {
    initializeDB();

    const handleAuthLogout = () => {
      setUserState(null);
    };
    window.addEventListener('auth:logout', handleAuthLogout);

    const token = getAccessToken();
    if (token) {
      api.get('/auth/me').then((res) => {
        if (res.data) {
          if (res.data.hasBusinessProfile) {
            localStorage.setItem('has_business_profile', 'true');
          }
          setUserState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              role: res.data.role,
              businessProfile: res.data.hasBusinessProfile ? (prev.businessProfile || ({} as never)) : null,
            };
          });
        }
      }).catch(() => {
        // ignore offline or unauthenticated
      });
    }

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    if (user.businessProfile) {
      localStorage.setItem('has_business_profile', 'true');
    }
    setUserState(user);
  };

  const handleLogout = () => {
    clearAccessToken();
    localStorage.removeItem('has_business_profile');
    setUserState(null);
  };

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent
          currentUser={currentUser}
          handleLoginSuccess={handleLoginSuccess}
          handleLogout={handleLogout}
        />
      </ToastProvider>
    </BrowserRouter>
  );
}
