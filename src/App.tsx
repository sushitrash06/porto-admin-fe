/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import type { User, Experience, Project } from './types';
import { Role } from './types';
import { Navbar } from './components/navbar';
import { LandingPage } from './components/landing-page';
import { LoginPage } from './components/login-page';
import { AdminUsers } from './components/admin-users';
import { AdminExperiences } from './components/admin-experience';
import { AdminProjects } from './components/admin-project';
import { AdminProfile } from './components/admin-profile';
import { AdminDiagnostics } from './components/admin-diagnostics';
import { getSessionPayload, clearAccessToken, getAccessToken } from './lib/auth';
import { useProfile } from './hooks/useProfile';
import {
  getUsers,
  getExperiences,
  getProjects,
  initializeDB
} from './utils/db';
import { Users, Briefcase, FolderGit2, ShieldCheck, Cpu, UserCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setUserState] = useState<User | null>(null);
  const [currentView, setView] = useState<'landing' | 'admin'>('landing');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('');

  const token = getAccessToken();
  const { data: profile } = useProfile({ enabled: !!currentUser && !!token });

  // Local snapshot lists to trigger updates instantly on edit/delete
  const [users, setUsers] = useState<User[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Initialize DB + restore session from JWT on mount
  useEffect(() => {
    initializeDB();

    // Restore session from stored JWT token (if still valid)
    const payload = getSessionPayload();
    if (payload) {
      setUserState({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        createdAt: '',
        updatedAt: '',
      });
    }

    // Loaded lists snapshot
    setUsers(getUsers());
    setExperiences(getExperiences());
    setProjects(getProjects());
  }, []);

  // Update tabs whenever user logs in or role shifts
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === Role.SUPER_ADMIN) {
        setActiveTab('users');
      } else {
        setActiveTab('experiences');
      }
    } else {
      setActiveTab('');
      setView('landing'); // Redirect to showcase if logged out
    }
  }, [currentUser]);

  // Synchronize state trigger
  const handleReloadDB = () => {
    setUsers(getUsers());
    setExperiences(getExperiences());
    setProjects(getProjects());
  };

  const handleLoginSuccess = (user: User) => {
    // Token is already saved by the useLogin hook
    setUserState(user);
    setIsLoginOpen(false);
    setView('admin'); // Directly drop them into the operational system
    handleReloadDB();
  };

  const handleLogout = () => {
    clearAccessToken();
    setUserState(null);
    setView('landing');
    handleReloadDB();
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50/50">

      {/* Universal Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        currentView={currentView}
        setView={setView}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Layout Area */}
      <main className="flex-1">
        {currentView === 'landing' ? (
          /* Public Portfolio Showcase Hub */
          <LandingPage
            users={users}
            experiences={experiences}
            projects={projects}
          />
        ) : (
          /* Secure Operational Admin Panel Workspace (Requires login auth) */
          currentUser && (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                {/* SIDEBAR NAVIGATION COLUMN (3 Columns) */}
                <div className="lg:col-span-3 space-y-6">

                  {/* Account Identity Card */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt={profile?.fullName || currentUser.email}
                        className="h-16 w-16 rounded-full object-cover ring-2 ring-neutral-100 shadow-xs"
                      />
                      <h3 className="mt-3 font-sans text-sm font-bold text-neutral-900 leading-none">
                        {profile?.fullName || 'Sandbox Member'}
                      </h3>
                      <p className="mt-1 font-sans text-xs text-neutral-400">
                        {currentUser.email}
                      </p>

                      <div className="mt-3.5 inline-flex items-center space-x-1 rounded-full bg-neutral-900 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{currentUser.role} Control</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-neutral-100 pt-4 text-xs">
                      {profile?.location && (
                        <p className="flex items-center justify-between text-neutral-500 py-1 font-sans">
                          <span className="font-medium">Station:</span>
                          <span className="font-semibold text-neutral-800">{profile.location}</span>
                        </p>
                      )}

                      <p className="flex items-center justify-between text-neutral-500 py-1 font-sans">
                        <span className="font-medium">Privilege:</span>
                        <span className="font-semibold text-neutral-800">
                          {currentUser.role === Role.SUPER_ADMIN ? 'Management & Audit' : 'Read/Write CRUD'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Sidebar Menu Toggles */}
                  <nav className="space-y-1.5" aria-label="Sidebar Menu">

                    {currentUser.role === Role.SUPER_ADMIN ? (
                      /* Superadmin options */
                      <>
                        <button
                          id="tab-users-btn"
                          onClick={() => setActiveTab('users')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'users'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <Users className="h-4 w-4" />
                          <span>User Management (CRUD)</span>
                        </button>

                        <button
                          id="tab-experiences-btn"
                          onClick={() => setActiveTab('experiences')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'experiences'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <Briefcase className="h-4 w-4" />
                          <span>Experiences (Audit only)</span>
                        </button>

                        <button
                          id="tab-projects-btn"
                          onClick={() => setActiveTab('projects')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'projects'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <FolderGit2 className="h-4 w-4" />
                          <span>Projects (Audit only)</span>
                        </button>

                        <button
                          id="tab-profile-btn"
                          onClick={() => setActiveTab('profile')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'profile'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>My Profile Settings</span>
                        </button>

                        <button
                          id="tab-diagnostics-btn"
                          onClick={() => setActiveTab('diagnostics')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'diagnostics'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>System Diagnostics</span>
                        </button>
                      </>
                    ) : (
                      /* Standard User options */
                      <>
                        <button
                          id="tab-experiences-btn-user"
                          onClick={() => setActiveTab('experiences')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'experiences'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <Briefcase className="h-4 w-4" />
                          <span>My Experiences (CRUD)</span>
                        </button>

                        <button
                          id="tab-projects-btn-user"
                          onClick={() => setActiveTab('projects')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'projects'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <FolderGit2 className="h-4 w-4" />
                          <span>My Projects (CRUD)</span>
                        </button>
                        
                        <button
                          id="tab-profile-btn-user"
                          onClick={() => setActiveTab('profile')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'profile'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <UserCheck className="h-4 w-4" />
                          <span>My Profile Settings</span>
                        </button>

                        <button
                          id="tab-diagnostics-btn-user"
                          onClick={() => setActiveTab('diagnostics')}
                          className={`flex w-full cursor-pointer items-center space-x-2.5 rounded-lg px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-all ${activeTab === 'diagnostics'
                              ? 'bg-neutral-900 text-white shadow-sm font-bold'
                              : 'text-neutral-600 hover:bg-white hover:text-neutral-900 border border-transparent hover:border-neutral-200/50'
                            }`}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>System Diagnostics</span>
                        </button>
                      </>
                    )}

                  </nav>

                </div>

                {/* CONTENT COMPONENT RESOLVER (9 Columns) */}
                <div className="lg:col-span-9 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs min-h-[500px]">

                  {/* Dynamic Heading Section */}
                  <div className="mb-6">
                    <h2 className="font-sans text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
                      {activeTab === 'users' && 'System User Databases'}
                      {activeTab === 'experiences' && (currentUser.role === Role.SUPER_ADMIN ? 'Career Experience Directories' : 'My Career Milestones')}
                      {activeTab === 'projects' && (currentUser.role === Role.SUPER_ADMIN ? 'Global Project Portfolios' : 'My Project Repositories')}
                      {activeTab === 'profile' && 'My Developer Profile Settings'}
                      {activeTab === 'diagnostics' && 'System Security & Route Diagnostics'}
                    </h2>
                    <p className="font-sans text-xs text-neutral-400 mt-1">
                      {activeTab === 'users' && 'Manage employee role configurations, email constraints, and security entry privileges.'}
                      {activeTab === 'experiences' && (currentUser.role === Role.SUPER_ADMIN ? 'Review and filter employee experiences.' : 'Maintain your full-cycle career history, company logs, and visibility status.')}
                      {activeTab === 'projects' && (currentUser.role === Role.SUPER_ADMIN ? 'Audit, filter, and inspect project details submitted by active platform users.' : 'Document your open-source projects, link relevant jobs, and customize stack tags.')}
                      {activeTab === 'profile' && 'Modify your identity fields, biography summary, skill sets, and visibility status.'}
                      {activeTab === 'diagnostics' && 'Run verified security tests and inspect raw JSON outputs for postman APIs.'}
                    </p>
                  </div>

                  {/* Components Routing Table */}
                  <div className="mt-2">
                    {activeTab === 'users' && currentUser.role === Role.SUPER_ADMIN && (
                      <AdminUsers onRefreshDB={handleReloadDB} />
                    )}
                    {activeTab === 'experiences' && (
                      <AdminExperiences currentUser={currentUser} onRefreshDB={handleReloadDB} />
                    )}
                    {activeTab === 'projects' && (
                      <AdminProjects currentUser={currentUser} onRefreshDB={handleReloadDB} />
                    )}
                    {activeTab === 'profile' && (
                      <AdminProfile />
                    )}
                    {activeTab === 'diagnostics' && (
                      <AdminDiagnostics />
                    )}
                  </div>

                </div>

              </div>
            </div>
          )
        )}
      </main>

      {/* Floating Login Modal Dialog */}
      {isLoginOpen && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setIsLoginOpen(false)}
        />
      )}

      {/* Modern High Contrast Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="font-sans text-xs text-neutral-400">
              © {new Date().getFullYear()} AdminPortfolio Hub. Complete persistent sandbox directory.
            </span>
            <div className="flex items-center space-x-1 font-mono text-[10px] text-neutral-400">
              <Cpu className="h-3 w-3" />
              <span>SYSTEM COMPILED WITH VITE & TAILWIND v4</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
