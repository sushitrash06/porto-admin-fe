/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../../types';
import { Role } from '../../types';
import { LogOut, LayoutDashboard, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { BrandLogo } from '../atoms/BrandLogo';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Reuse cached profile details for logged in user
  const { data: profile } = useProfile({ enabled: !!currentUser });
  const { data: businessProfile } = useBusinessProfile({ enabled: !!currentUser });

  const isLandingActive = location.pathname === '/';
  const isAdminActive = location.pathname.startsWith('/admin');

  const handleAdminRedirect = () => {
    if (currentUser) {
      if (currentUser.role === Role.ADMIN) {
        navigate('/admin/dashboard');
      } else if (currentUser.businessProfile) {
        navigate('/admin/business/dashboard');
      } else {
        navigate('/admin/experiences');
      }
    }
  };

  const handleScrollTo = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EAE5DD] bg-white/95 backdrop-blur-md shadow-[0_2px_8px_rgba(32,39,68,0.03)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <BrandLogo size="md" to="/" showTagline={false} />
          {currentUser?.role === Role.ADMIN && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#E8E0FF] border border-[#D5C6FF] px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#5533CC]">
              <ShieldCheck className="h-3 w-3 text-[#8B6CF6]" />
              Superadmin
            </span>
          )}
        </div>

        {/* Middle Navigation Links (Logged-out visitors only) */}
        {!currentUser && (
          <nav className="hidden md:flex items-center space-x-7">
            <button
              onClick={() => handleScrollTo('features')}
              className="text-sm font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('audiences')}
              className="text-sm font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer"
            >
              Solutions
            </button>
            <button
              onClick={() => handleScrollTo('templates')}
              className="text-sm font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer"
            >
              Templates
            </button>
            <button
              onClick={() => handleScrollTo('developer-api')}
              className="text-sm font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Developer API</span>
              <span className="rounded-md bg-[#E8E0FF] px-1.5 py-0.5 text-[9px] font-bold text-[#8B6CF6] uppercase">v1</span>
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="text-sm font-semibold text-[#69718A] hover:text-[#202744] transition-colors cursor-pointer"
            >
              How It Works
            </button>
          </nav>
        )}

        {/* Action Panel */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <>
              {currentUser.role === Role.ADMIN && (
                <Link
                  id="nav-superadmin-btn"
                  to="/admin/dashboard"
                  className="hidden sm:inline-flex items-center space-x-1.5 rounded-full bg-[#E8E0FF] border border-[#D5C6FF] px-3.5 py-1.5 font-sans text-xs font-bold text-[#5533CC] hover:bg-[#DCD0FF] transition-all cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8B6CF6]" />
                  <span>Admin Console</span>
                </Link>
              )}

              <Link
                id="nav-landing-btn"
                to="/"
                className={`flex items-center space-x-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isLandingActive
                    ? 'bg-[#202744] text-white shadow-xs'
                    : 'text-[#69718A] hover:bg-slate-100 hover:text-[#202744]'
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-[#8B6CF6]" />
                <span>Showcase</span>
              </Link>

              {/* Workspace Switcher */}
              <div className="hidden sm:block">
                <WorkspaceSwitcher
                  currentUser={{
                    name: profile?.fullName || businessProfile?.businessName || currentUser.email,
                    email: currentUser.email,
                    hasProfile: !!profile,
                    hasBusinessProfile:
                      !!currentUser.businessProfile ||
                      !!businessProfile ||
                      localStorage.getItem('has_business_profile') === 'true',
                  }}
                  currentWorkspace={location.pathname.includes('/business') ? 'BUSINESS' : 'PERSONAL'}
                />
              </div>

              <button
                id="nav-admin-btn"
                onClick={handleAdminRedirect}
                className={`flex items-center space-x-1.5 rounded-full px-4 py-1.5 font-sans text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  isAdminActive
                    ? 'bg-[#8B6CF6] text-white shadow-xs'
                    : 'bg-[#202744] text-white hover:bg-[#151928]'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Workspace</span>
              </button>

              {/* Profile pill */}
              <div className="hidden items-center space-x-3 border-l border-[#EAE5DD] pl-3 md:flex">
                <img
                  src={
                    profile?.profileImage ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={profile?.fullName || currentUser.email}
                  className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-[#EAE5DD]"
                />
                <div className="text-left">
                  <p className="font-sans text-xs font-bold text-[#202744] leading-tight truncate max-w-[120px]">
                    {profile?.fullName || currentUser.email.split('@')[0]}
                  </p>
                  <p className="font-sans text-[10px] font-semibold text-[#69718A]">
                    {currentUser.role === Role.ADMIN ? 'Administrator' : 'Creator'}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                id="logout-btn"
                onClick={() => {
                  onLogout();
                  navigate('/');
                }}
                className="flex items-center space-x-1.5 rounded-full border border-[#EAE5DD] bg-white px-3 py-1.5 font-sans text-xs font-semibold text-[#69718A] transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 cursor-pointer shadow-3xs"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <Link
                id="open-login-btn"
                to="/login"
                className="text-xs sm:text-sm font-bold text-[#202744] hover:text-[#8B6CF6] transition-colors cursor-pointer px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                id="open-register-btn"
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#8B6CF6] hover:bg-[#7A56F4] px-4 sm:px-5 py-2 font-sans text-xs sm:text-sm font-bold text-white transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#FFC45B]" />
                <span>Create your portfolio</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
