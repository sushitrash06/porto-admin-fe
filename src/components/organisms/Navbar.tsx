/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../../types';
import { Role } from '../../types';
import { LogOut, LayoutDashboard, Compass } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Reuse cached profile details for logged in user
  const { data: profile } = useProfile({ enabled: !!currentUser });

  const isLandingActive = location.pathname === '/';
  const isAdminActive = location.pathname.startsWith('/admin');

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAdminRedirect = () => {
    if (currentUser) {
      if (currentUser.role === Role.ADMIN) {
        navigate('/admin/dashboard');
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
    <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div
          onClick={handleLogoClick}
          className="flex cursor-pointer items-center space-x-2 transition active:scale-95"
        >
          {currentUser ? (
            <>
              <div className="h-8 w-8 bg-black rounded-md flex items-center justify-center">
                <div className="h-3 w-3 bg-white rotate-45"></div>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900 font-sans">
                  DevPortal
                </span>
                <span className="ml-1.5 rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Admin
                </span>
              </div>
            </>
          ) : (
            <span className="font-sans text-xl font-bold tracking-tight text-neutral-900">
              Folio
            </span>
          )}
        </div>

        {/* Middle Navigation Links (Logged-out visitors only) */}
        {!currentUser && (
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleScrollTo('features')}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('testimonials')}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Testimonials
            </button>
            <button
              onClick={() => handleScrollTo('pricing')}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </nav>
        )}

        {/* Action Panel */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <>
              <Link
                id="nav-landing-btn"
                to="/"
                className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isLandingActive
                    ? 'bg-black text-white shadow-xs hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Showcase Hub</span>
              </Link>
              
              <button
                id="nav-admin-btn"
                onClick={handleAdminRedirect}
                className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 font-sans text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isAdminActive
                    ? 'bg-black text-white shadow-xs hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Operational Panel</span>
              </button>

              {/* Profile pill */}
              <div className="hidden items-center space-x-3 border-l border-slate-200 pl-4 md:flex">
                <img
                  src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                  alt={profile?.fullName || currentUser.email}
                  className="h-7 w-7 rounded-full object-cover border border-slate-200"
                />
                <div className="text-left">
                  <p className="font-sans text-xs font-medium text-slate-900 leading-tight">
                    {profile?.fullName || currentUser.email.split('@')[0]}
                  </p>
                  <p className="font-mono text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                    {currentUser.role}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                id="logout-btn"
                onClick={() => { onLogout(); navigate('/'); }}
                className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 font-sans text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                id="open-login-btn"
                to="/login"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-950 px-4 py-1.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-all cursor-pointer"
              >
                Login
              </Link>
              <Link
                id="open-register-btn"
                to="/register"
                className="text-sm font-bold text-white bg-neutral-950 hover:bg-neutral-800 px-4.5 py-2.5 rounded-full transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
