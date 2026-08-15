import React from 'react';
import { NavLink } from 'react-router-dom';
import type { User, Profile, BusinessProfile } from '../../types';
import { Role } from '../../types';
import { Users, Briefcase, FolderGit2, ShieldCheck, UserCheck, Shield, LayoutDashboard, Building2, AlertCircle, Globe } from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  profile?: Profile;
  businessProfile?: BusinessProfile;
  isProfileIncomplete?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, profile, businessProfile, isProfileIncomplete }) => {
  const isSuper = currentUser.role === Role.SUPER_ADMIN;
  const isBusiness = currentUser.role === Role.BUSINESS;

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex w-full items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${isActive
      ? 'bg-neutral-900 text-white shadow-sm font-bold'
      : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
    }`;
    
  const disabledLinkStyle = "flex w-full items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all opacity-40 pointer-events-none grayscale";

  // Resolve metadata for the Identity Card
  const displayName = isBusiness
    ? (businessProfile?.businessName || 'Business Owner')
    : (profile?.fullName || 'Sandbox Member');

  const displayImage = isBusiness
    ? (businessProfile?.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200')
    : (profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');

  const displayLocation = isBusiness
    ? businessProfile?.location
    : profile?.location;

  return (
    <div className="space-y-6">
      {/* Account Identity Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col items-center text-center">
          <img
            src={displayImage}
            alt={displayName}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-neutral-100 shadow-xs"
          />
          <h3 className="mt-3 font-sans text-sm font-bold text-neutral-900 leading-none">
            {displayName}
          </h3>
          <p className="mt-1 font-sans text-xs text-neutral-450">
            {currentUser.email}
          </p>

          <div className="mt-3.5 inline-flex items-center space-x-1 rounded-full bg-neutral-900 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
            <ShieldCheck className="h-3 w-3" />
            <span>{currentUser.role} Control</span>
          </div>
        </div>

        <div className="mt-5 border-t border-neutral-100 pt-4 text-xs">
          {displayLocation && (
            <p className="flex items-center justify-between text-neutral-500 py-1 font-sans">
              <span className="font-medium">Location:</span>
              <span className="font-semibold text-neutral-800">{displayLocation}</span>
            </p>
          )}

          <p className="flex items-center justify-between text-neutral-500 py-1 font-sans">
            <span className="font-medium">Privilege:</span>
            <span className="font-semibold text-neutral-800 text-right">
              {isSuper ? 'Management & Audit' : isBusiness ? 'Business Catalog' : 'Read/Write'}
            </span>
          </p>
        </div>
      </div>

      {/* Preview Portfolio Link */}
      {!isProfileIncomplete && (
        <a
          href={`http://localhost:3002/${currentUser.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center space-x-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 font-sans text-xs font-bold text-indigo-700 uppercase tracking-wider hover:bg-indigo-100 hover:border-indigo-300 transition active:scale-[0.98]"
        >
          <Globe className="h-4 w-4" />
          <span>Preview Portfolio</span>
        </a>
      )}

      {/* Sidebar Menu Toggles */}
      <nav className="space-y-1.5" aria-label="Sidebar Menu">
        {isProfileIncomplete && (
            <div className="mb-4 rounded-md border border-orange-200 bg-orange-50 p-3 text-orange-700 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-sans text-[11px] font-medium leading-relaxed">
                    Please complete your profile details to unlock other dashboard features.
                </span>
            </div>
        )}

        {isSuper ? (
          /* Superadmin options */
          <>
            <NavLink id="tab-users-btn" to="/admin/users" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </NavLink>

            <NavLink id="tab-experiences-btn" to="/admin/experiences" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <Briefcase className="h-4 w-4" />
              <span>Experiences (Audit only)</span>
            </NavLink>

            <NavLink id="tab-projects-btn" to="/admin/projects" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <FolderGit2 className="h-4 w-4" />
              <span>Projects (Audit only)</span>
            </NavLink>

            <NavLink id="tab-profile-btn" to="/admin/profile" className={linkStyle}>
              <UserCheck className="h-4 w-4" />
              <span>My Profile Settings</span>
            </NavLink>

            <NavLink id="tab-diagnostics-btn" to="/admin/diagnostics" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <Shield className="h-4 w-4" />
              <span>System Diagnostics</span>
            </NavLink>
          </>
        ) : isBusiness ? (
          /* Business options */
          <>
            <NavLink id="tab-business-dashboard-btn" to="/admin/business/dashboard" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Business Dashboard</span>
            </NavLink>

            <NavLink id="tab-business-profile-btn" to="/admin/business/profile" className={linkStyle}>
              <Building2 className="h-4 w-4" />
              <span>Business Profile</span>
            </NavLink>

            <NavLink id="tab-business-services-btn" to="/admin/business/services" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <Briefcase className="h-4 w-4" />
              <span>Services Catalog</span>
            </NavLink>

            <NavLink id="tab-business-projects-btn" to="/admin/business/projects" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <FolderGit2 className="h-4 w-4" />
              <span>Business Projects</span>
            </NavLink>
          </>
        ) : (
          /* Standard User options */
          <>
            <NavLink id="tab-experiences-btn-user" to="/admin/experiences" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <Briefcase className="h-4 w-4" />
              <span>My Experiences</span>
            </NavLink>

            <NavLink id="tab-projects-btn-user" to="/admin/projects" className={isProfileIncomplete ? disabledLinkStyle : linkStyle}>
              <FolderGit2 className="h-4 w-4" />
              <span>My Projects</span>
            </NavLink>

            <NavLink id="tab-profile-btn-user" to="/admin/profile" className={linkStyle}>
              <UserCheck className="h-4 w-4" />
              <span>My Profile Settings</span>
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
};

