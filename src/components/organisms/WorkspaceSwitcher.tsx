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

  const hasBusinessProfile =
    !!currentUser.hasBusinessProfile || localStorage.getItem('has_business_profile') === 'true';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E5E1DA] text-[#202744] transition-all text-sm font-semibold shadow-3xs cursor-pointer"
        >
          {currentWorkspace === 'BUSINESS' ? (
            <div className="w-6 h-6 rounded-lg bg-[#E7F2FF] text-[#4697F5] flex items-center justify-center border border-[#BFDEFF] shrink-0">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-[#E8E0FF] text-[#8B6CF6] flex items-center justify-center border border-[#D5C6FF] shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="text-left">
            <p className="text-xs font-bold leading-tight text-[#202744] whitespace-nowrap">
              {currentWorkspace === 'BUSINESS' ? 'Business Studio' : 'Personal Portfolio'}
            </p>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#69718A] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-[#EAE5DD] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#69718A] uppercase font-mono">
              Switch Workspace
            </div>

            {/* Personal Option */}
            <button
              type="button"
              onClick={() => handleSelectWorkspace('PERSONAL')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                currentWorkspace === 'PERSONAL'
                  ? 'bg-[#E8E0FF]/60 text-[#5533CC] font-bold border border-[#D5C6FF]'
                  : 'hover:bg-[#FAF8F5] text-[#202744]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E8E0FF] text-[#8B6CF6] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Personal Portfolio</p>
                  <p className="text-[10px] text-[#69718A]">Career, skills & personal projects</p>
                </div>
              </div>
              {currentWorkspace === 'PERSONAL' && <Check className="w-4 h-4 text-[#8B6CF6] shrink-0" />}
            </button>

            {/* Business Option */}
            {hasBusinessProfile ? (
              <button
                type="button"
                onClick={() => handleSelectWorkspace('BUSINESS')}
                className={`w-full flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  currentWorkspace === 'BUSINESS'
                    ? 'bg-[#E7F2FF]/60 text-[#1E6FD6] font-bold border border-[#BFDEFF]'
                    : 'hover:bg-[#FAF8F5] text-[#202744]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#E7F2FF] text-[#4697F5] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Commercial Business</p>
                    <p className="text-[10px] text-[#69718A]">Services, clients & WhatsApp inquiries</p>
                  </div>
                </div>
                {currentWorkspace === 'BUSINESS' && <Check className="w-4 h-4 text-[#4697F5] shrink-0" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowActivateModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl text-left text-xs bg-gradient-to-r from-[#E7F2FF] to-[#E8E0FF] hover:opacity-95 text-[#202744] border border-[#BFDEFF] transition-all group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#4697F5] text-white flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-[#202744]">Activate Business Profile</p>
                  <p className="text-[10px] text-[#69718A]">Unlock commercial catalog & services</p>
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
