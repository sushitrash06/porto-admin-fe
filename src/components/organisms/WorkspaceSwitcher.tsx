/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Plus, ChevronDown, Check } from 'lucide-react';
import { ActivateBusinessModal } from './ActivateBusinessModal';

export interface WorkspaceSwitcherProps {
  currentUser: {
    name?: string;
    email: string;
    hasProfile?: boolean;
    hasBusinessProfile?: boolean;
  };
  currentWorkspace: 'PERSONAL' | 'BUSINESS';
  onWorkspaceChange?: (workspace: 'PERSONAL' | 'BUSINESS') => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentUser,
  currentWorkspace,
  onWorkspaceChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectWorkspace = (type: 'PERSONAL' | 'BUSINESS') => {
    setIsOpen(false);
    onWorkspaceChange?.(type);
    if (type === 'PERSONAL') {
      navigate('/admin/profile');
    } else {
      navigate('/admin/business/dashboard');
    }
  };

  const hasBusinessProfile = !!currentUser.hasBusinessProfile || localStorage.getItem('has_business_profile') === 'true';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-all text-sm font-medium shadow-sm cursor-pointer"
        >
          {currentWorkspace === 'BUSINESS' ? (
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="text-left">
            <p className="text-xs font-semibold leading-tight text-white whitespace-nowrap">
              {currentWorkspace === 'BUSINESS' ? 'Business Studio' : 'Personal Portfolio'}
            </p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Pilih Ruang Kerja (Workspace)
            </div>

            {/* Opsi Personal */}
            <button
              type="button"
              onClick={() => handleSelectWorkspace('PERSONAL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-colors cursor-pointer ${
                currentWorkspace === 'PERSONAL'
                  ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20'
                  : 'hover:bg-slate-800/70 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium">Personal Developer</p>
                  <p className="text-[10px] text-slate-400">CV, Resume & Proyek Pribadi</p>
                </div>
              </div>
              {currentWorkspace === 'PERSONAL' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
            </button>

            {/* Opsi Bisnis */}
            {hasBusinessProfile ? (
              <button
                type="button"
                onClick={() => handleSelectWorkspace('BUSINESS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl text-left text-sm transition-colors cursor-pointer ${
                  currentWorkspace === 'BUSINESS'
                    ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/20'
                    : 'hover:bg-slate-800/70 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Business / Agency</p>
                    <p className="text-[10px] text-slate-400">Layanan, Portofolio & Klien</p>
                  </div>
                </div>
                {currentWorkspace === 'BUSINESS' && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowActivateModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl text-left text-sm bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 text-blue-300 border border-blue-500/30 transition-all group cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-blue-200">Aktifkan Profil Bisnis</p>
                  <p className="text-[10px] text-blue-300/80">Buat profil software house / agency</p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {showActivateModal && (
        <ActivateBusinessModal
          isOpen={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          onSuccess={() => {
            setShowActivateModal(false);
            navigate('/admin/business/dashboard');
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default WorkspaceSwitcher;
