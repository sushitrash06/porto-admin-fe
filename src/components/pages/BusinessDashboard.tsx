/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessProfile } from '../../hooks/useBusinessProfile';
import { useBusinessServices } from '../../hooks/useBusinessServices';
import { useBusinessProjects } from '../../hooks/useBusinessProjects';
import {
  Building2, Briefcase, FolderGit2, ArrowRight, ShieldCheck,
  CheckCircle2, AlertCircle, Loader2, Sparkles, Globe, Mail, Phone, MapPin,
  Copy, Check
} from 'lucide-react';

export const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load queries
  const { data: profile, isLoading: isProfileLoading } = useBusinessProfile();
  const { data: services, isLoading: isServicesLoading } = useBusinessServices();
  const { data: projects, isLoading: isProjectsLoading } = useBusinessProjects();

  const isDataLoading = isProfileLoading || isServicesLoading || isProjectsLoading;

  // Determine profile completeness
  const profileStatus = React.useMemo(() => {
    if (!profile) return { complete: false, label: 'Not Created', color: 'text-rose-500 bg-rose-50 border-rose-200' };
    const requiredFields = [profile.businessName, profile.contactEmail, profile.phoneNumber, profile.location];
    const filledCount = requiredFields.filter(Boolean).length;
    if (filledCount === requiredFields.length) {
      return { complete: true, label: 'Complete & Active', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    return { complete: false, label: 'Incomplete Details', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  }, [profile]);

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-450">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500 mb-3" />
        <p className="font-sans text-sm">Loading business dashboard insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-white/5 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-250 backdrop-blur-xs">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Business Control Center</span>
            </div>
            <h2 className="font-sans text-2xl font-extrabold tracking-tight">
              {profile?.businessName || 'Welcome to Your Business Hub'}
            </h2>
            <p className="max-w-xl font-sans text-xs text-slate-300 leading-relaxed">
              {profile?.description || 'Build your business profile, showcase your catalogs, specify list services and release commercial project logs to attract potential clients.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/business/profile')}
            className="self-start md:self-auto shrink-0 flex items-center space-x-2 rounded-lg bg-white px-4 py-2.5 font-sans text-xs font-bold text-slate-950 transition hover:bg-slate-100 active:scale-98"
          >
            <span>Configure Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Profile completeness card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Configuration</span>
            <Building2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <h3 className="font-sans text-base font-extrabold text-slate-900">
              {profile?.businessName ? 'Active Business' : 'No Business Setup'}
            </h3>
            <span className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 mt-2 font-mono text-[9px] font-bold uppercase tracking-wider border ${profileStatus.color}`}>
              {profileStatus.complete ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              <span>{profileStatus.label}</span>
            </span>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-3 flex justify-between items-center">
            <span className="font-sans text-[10px] text-slate-400">Settings Page</span>
            <button
              onClick={() => navigate('/admin/business/profile')}
              className="font-sans text-[10px] font-bold text-black hover:underline inline-flex items-center space-x-0.5"
            >
              <span>Manage Details</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Total services card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog Offerings</span>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <h3 className="font-sans text-2xl font-extrabold text-slate-900">
              {services?.length || 0}
            </h3>
            <p className="font-sans text-[11px] text-slate-450 mt-1">Listed commercial services</p>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-3 flex justify-between items-center">
            <span className="font-sans text-[10px] text-slate-400">Services CRUD</span>
            <button
              onClick={() => navigate('/admin/business/services')}
              className="font-sans text-[10px] font-bold text-black hover:underline inline-flex items-center space-x-0.5"
            >
              <span>View Catalog</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Total projects card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Business Projects</span>
            <FolderGit2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4">
            <h3 className="font-sans text-2xl font-extrabold text-slate-900">
              {projects?.length || 0}
            </h3>
            <p className="font-sans text-[11px] text-slate-450 mt-1">Released business case studies</p>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-3 flex justify-between items-center">
            <span className="font-sans text-[10px] text-slate-400">Projects CRUD</span>
            <button
              onClick={() => navigate('/admin/business/projects')}
              className="font-sans text-[10px] font-bold text-black hover:underline inline-flex items-center space-x-0.5"
            >
              <span>View Projects</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Profile Snapshot and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Profile Snapshot Column (7 cols) */}
        <div className="md:col-span-7 rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-4">
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building2 className="h-4.5 w-4.5 text-slate-500" />
            <span>Business Profile Snapshot</span>
          </h3>

          {profile ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={profile.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200'}
                  alt={profile.businessName}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-sans text-base font-bold text-slate-900">{profile.businessName}</h4>
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs text-blue-600 hover:underline inline-flex items-center space-x-1"
                    >
                      <Globe className="h-3 w-3" />
                      <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* User ID Copy Component */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between font-mono text-[10px] text-slate-600">
                <div className="flex flex-col">
                  <span className="font-sans text-[8px] font-bold text-slate-400 uppercase tracking-wider">User ID Key</span>
                  <span className="mt-0.5 select-all">{profile.userId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyUserId(profile.userId)}
                  className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title="Copy User ID"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs font-sans text-slate-500">
                {profile.location && (
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Location</span>
                    <div className="flex items-center space-x-1.5 text-slate-800">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  </div>
                )}
                {profile.contactEmail && (
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Email</span>
                    <div className="flex items-center space-x-1.5 text-slate-800">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{profile.contactEmail}</span>
                    </div>
                  </div>
                )}
                {profile.phoneNumber && (
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Phone</span>
                    <div className="flex items-center space-x-1.5 text-slate-800">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{profile.phoneNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <Building2 className="mx-auto h-8 w-8 text-slate-300 mb-2 stroke-1" />
              <p className="font-sans text-xs text-slate-400 font-medium">Business Profile Not Formed Yet</p>
              <p className="font-sans text-[10px] text-slate-350 mt-0.5">Please populate the business details form to activate your profile.</p>
            </div>
          )}
        </div>

        {/* Quick Operations Column (5 cols) */}
        <div className="md:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="h-4.5 w-4.5 text-slate-500" />
              <span>Quick Operations</span>
            </h3>

            <div className="space-y-2 mt-4">
              <button
                onClick={() => navigate('/admin/business/profile')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-450 hover:bg-slate-50 transition font-sans text-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">Edit Corporate Settings</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/admin/business/services')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-450 hover:bg-slate-50 transition font-sans text-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">Add Service to Catalog</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/admin/business/projects')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-450 hover:bg-slate-50 transition font-sans text-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">Create Business Project</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
