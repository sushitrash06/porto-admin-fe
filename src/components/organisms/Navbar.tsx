/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../../types';
import { Role } from '../../types';
import { LogOut, LayoutDashboard, Compass, Layers, ShieldCheck } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

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

  const handleLogoClick = () => {
    navigate('/');
  };

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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-[#08090d]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center space-x-2.5 transition active:scale-95"
        >
          <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-inner">
            <Layers className="h-4 w-4" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight text-white font-sans">
              Foliowalaweh
            </span>
            {currentUser?.role === Role.ADMIN && (
              <span className="rounded-md bg-purple-950/60 border border-purple-700/40 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-purple-300">
                Superadmin
              </span>
            )}
          </div>
        </div>

        {/* Middle Navigation Links (Logged-out visitors only) */}
        {!currentUser && (
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleScrollTo('features')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('features')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Business Catalog
            </button>
            <button
              onClick={() => handleScrollTo('features')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Theme Studio
            </button>
            <button
              onClick={() => handleScrollTo('features')}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Pricing
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
                  className="hidden sm:inline-flex items-center space-x-1.5 rounded-full bg-purple-950/50 border border-purple-600/40 px-3.5 py-1.5 font-sans text-xs font-semibold text-purple-300 hover:bg-purple-900/40 transition-all cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Superadmin</span>
                </Link>
              )}

              <Link
                id="nav-landing-btn"
                to="/"
                className={`flex items-center space-x-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isLandingActive
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Showcase Hub</span>
              </Link>
              
              {/* Workspace Switcher */}
              <div className="hidden sm:block">
                <WorkspaceSwitcher
                  currentUser={{
                    name: profile?.fullName || businessProfile?.businessName || currentUser.email,
                    email: currentUser.email,
                    hasProfile: !!profile,
                    hasBusinessProfile: !!currentUser.businessProfile || !!businessProfile || localStorage.getItem('has_business_profile') === 'true',
                  }}
                  currentWorkspace={location.pathname.includes('/business') ? 'BUSINESS' : 'PERSONAL'}
                />
              </div>

              <button
                id="nav-admin-btn"
                onClick={handleAdminRedirect}
                className={`flex items-center space-x-1.5 rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isAdminActive
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Workspace</span>
              </button>

              {/* Profile pill */}
              <div className="hidden items-center space-x-3 border-l border-zinc-800 pl-4 md:flex">
                <img
                  src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={profile?.fullName || currentUser.email}
                  className="h-7 w-7 rounded-full object-cover border border-zinc-700"
                />
                <div className="text-left">
                  <p className="font-sans text-xs font-medium text-zinc-200 leading-tight">
                    {profile?.fullName || currentUser.email.split('@')[0]}
                  </p>
                  <p className="font-mono text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                    {currentUser.role}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                id="logout-btn"
                onClick={() => { onLogout(); navigate('/'); }}
                className="flex items-center space-x-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-sans text-xs font-semibold text-zinc-400 transition hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/60 active:scale-95 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                id="open-login-btn"
                to="/login"
                className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                id="open-register-btn"
                to="/register"
                className="text-sm font-semibold text-zinc-950 bg-white hover:bg-zinc-100 px-5 py-2 rounded-full transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
