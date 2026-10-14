/* eslint-disable react-hooks/set-state-in-effect */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  useBusinessProfile, 
  useUpdateBusinessProfile, 
  useUploadBusinessLogo, 
  useUploadBusinessBanner 
} from '../../hooks/useBusinessProfile';
import { 
  Building2, ShieldAlert, Loader2, Camera, Mail, Phone, MapPin, 
  Globe, EyeOff, Image as ImageIcon, Link2, Copy, Check, Palette
} from 'lucide-react';
import { BusinessThemeTab } from '../organisms/BusinessThemeTab';

type BusinessTab = 'brand' | 'theme';

export const BusinessProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BusinessTab>('brand');
  const { data: profile, isLoading, isError, error: fetchError } = useBusinessProfile();
  const updateProfileMutation = useUpdateBusinessProfile();
  const uploadLogoMutation = useUploadBusinessLogo();
  const uploadBannerMutation = useUploadBusinessBanner();

  // Fields State
  const [businessName, setBusinessName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Messages
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [copiedUserId, setCopiedUserId] = useState<boolean>(false);

  const handleCopyUserId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedUserId(true);
    setTimeout(() => setCopiedUserId(false), 2000);
  };

  // Track initialization
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Populate fields when data arrives
  useEffect(() => {
    if (profile && !isInitialized) {
      setBusinessName(profile.businessName || '');
      setDescription(profile.description || '');
      setLocation(profile.location || '');
      setContactEmail(profile.contactEmail || '');
      setPhoneNumber(profile.phoneNumber || '');
      setWebsite(profile.website || '');
      setIsPublic(profile.isPublic ?? true);
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg('');
      setSuccessMsg('');
      uploadLogoMutation.mutate(file, {
        onSuccess: () => {
          setSuccessMsg('Business logo updated successfully!');
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || err.message || 'Logo upload failed.');
        }
      });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg('');
      setSuccessMsg('');
      uploadBannerMutation.mutate(file, {
        onSuccess: () => {
          setSuccessMsg('Business banner image updated successfully!');
        },
        onError: (err) => {
          setErrorMsg(err.response?.data?.message || err.message || 'Banner upload failed.');
        }
      });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!businessName.trim()) {
      setErrorMsg('Business Name is required.');
      return;
    }

    updateProfileMutation.mutate({
      businessName: businessName.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      website: website.trim() || undefined,
      isPublic
    }, {
      onSuccess: () => {
        setSuccessMsg('Business settings saved successfully!');
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to update business settings.');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#69718A]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-[#8B6CF6] border border-violet-100 shadow-xs mb-3">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <p className="font-sans text-sm font-semibold text-[#202744]">Loading business settings...</p>
        <p className="font-sans text-xs text-[#69718A] mt-1">Fetching corporate profile parameters</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-start space-x-3.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-rose-900 font-sans shadow-xs">
        <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold">Business Profile Load Failed</h3>
          <p className="mt-1 text-xs text-rose-700">
            {fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-6 border-b border-[#F0EBE1] pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-[#8B6CF6] border border-violet-100 shadow-xs">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-bold tracking-tight text-[#202744]">
              Business Profile Configuration
            </h2>
            <p className="font-sans text-xs text-[#69718A] mt-0.5">
              Define your brand parameters, contact information, location, and visibility showcase details.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation Switcher */}
      <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#FAF8F5] p-1.5 border border-[#EAE5DD]">
        <button
          type="button"
          onClick={() => setActiveTab('brand')}
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-sans text-xs font-semibold transition cursor-pointer ${
            activeTab === 'brand'
              ? 'bg-white text-[#202744] shadow-xs border border-[#EAE5DD]'
              : 'text-[#69718A] hover:text-[#202744]'
          }`}
        >
          <Building2 className="h-4 w-4 text-[#8B6CF6]" />
          <span>Brand Identity & Media</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-sans text-xs font-semibold transition cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-white text-[#202744] shadow-xs border border-[#EAE5DD]'
              : 'text-[#69718A] hover:text-[#202744]'
          }`}
        >
          <Palette className="h-4 w-4 text-[#4697F5]" />
          <span>Theme & Showcase Bisnis</span>
        </button>
      </div>

      {activeTab === 'brand' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Media Assets (Logo & Banner) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden flex flex-col items-center text-center pb-5">
            {/* Banner Background */}
            <div className="w-full h-28 bg-[#FAF8F5] border-b border-[#F0EBE1] relative">
              {profile?.bannerImage ? (
                <img
                  src={profile.bannerImage}
                  alt="Business Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-r from-violet-50/50 to-blue-50/50 flex items-center justify-center text-[#8B6CF6]/40">
                  <ImageIcon className="h-7 w-7 stroke-1" />
                </div>
              )}
            </div>

            {/* Logo Container */}
            <div className="relative group -mt-12">
              <img
                src={profile?.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200'}
                alt={businessName || 'Business Logo'}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-85 transition bg-white"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-[#202744]/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-5 w-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={uploadLogoMutation.isPending}
                  className="sr-only"
                />
              </label>
              {uploadLogoMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#202744]/80 text-white rounded-full">
                  <Loader2 className="h-5 w-5 animate-spin text-[#8B6CF6]" />
                </div>
              )}
            </div>

            <h3 className="mt-4 px-3 font-sans text-base font-bold text-[#202744] leading-snug">
              {businessName || 'Corporate Showcase'}
            </h3>
            <p className="mt-1 px-4 font-sans text-xs text-[#69718A] line-clamp-2">
              {description || 'Establish your corporate identity summary...'}
            </p>

            <div className="mt-3.5 inline-flex items-center space-x-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE5DD] px-3 py-1 font-sans text-xs font-semibold text-[#69718A]">
              {isPublic ? (
                <>
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Public Listing</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-[#69718A]" />
                  <span>Hidden Listing</span>
                </>
              )}
            </div>

            {profile?.userId && (
              <div className="mt-4 px-5 w-full">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DD] flex items-center justify-between font-mono text-xs text-[#202744] text-left">
                  <div className="flex flex-col">
                    <span className="font-sans text-[9px] font-bold text-[#69718A] uppercase tracking-wider">User ID Key</span>
                    <span className="mt-0.5 select-all font-mono">{profile.userId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUserId(profile.userId)}
                    className="p-1.5 rounded-lg hover:bg-white text-[#69718A] hover:text-[#8B6CF6] transition cursor-pointer border border-transparent hover:border-[#EAE5DD]"
                    title="Copy User ID"
                  >
                    {copiedUserId ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 w-full border-t border-[#F0EBE1] px-5 pt-4 text-left space-y-2.5 font-sans text-xs text-[#69718A]">
              {location && (
                <div className="flex items-center space-x-2.5">
                  <MapPin className="h-4 w-4 text-[#8B6CF6] shrink-0" />
                  <span className="truncate text-[#202744]">{location}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center space-x-2.5">
                  <Mail className="h-4 w-4 text-[#8B6CF6] shrink-0" />
                  <span className="truncate text-[#202744]">{contactEmail}</span>
                </div>
              )}
              {phoneNumber && (
                <div className="flex items-center space-x-2.5">
                  <Phone className="h-4 w-4 text-[#8B6CF6] shrink-0" />
                  <span className="truncate text-[#202744]">{phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Banner Media Asset box */}
          <div className="rounded-2xl border border-[#EAE5DD] bg-white p-5 shadow-xs space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#202744] flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-[#8B6CF6]" />
              <span>Banner Management</span>
            </h4>
            <div className="space-y-2">
              <div className="relative group/banner rounded-xl overflow-hidden border border-[#EAE5DD] bg-[#FAF8F5] h-28 flex items-center justify-center">
                {profile?.bannerImage ? (
                  <img
                    src={profile.bannerImage}
                    alt="Corporate Banner Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-[#69718A] flex flex-col items-center text-center p-2">
                    <ImageIcon className="h-7 w-7 text-[#8B6CF6]/40 stroke-1 mb-1" />
                    <span className="font-sans text-[10px] font-semibold">No Banner Image</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-[#202744]/70 text-white flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition duration-150 cursor-pointer">
                  <Camera className="h-5 w-5 mr-2 text-white" />
                  <span className="font-sans text-xs font-bold">Change Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    disabled={uploadBannerMutation.isPending}
                    className="sr-only"
                  />
                </label>
                {uploadBannerMutation.isPending && (
                  <div className="absolute inset-0 bg-[#202744]/80 text-white flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[#8B6CF6]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form Settings */}
        <form onSubmit={handleSaveProfile} className="lg:col-span-8 space-y-6">
          {/* Notifications */}
          {successMsg && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-sans text-emerald-800 font-semibold shadow-xs">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-start space-x-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-sans text-rose-800 font-semibold shadow-xs">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form details */}
          <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-5">
            <h4 className="font-sans text-sm font-bold text-[#202744] flex items-center space-x-2 border-b border-[#F0EBE1] pb-3">
              <Building2 className="h-4 w-4 text-[#8B6CF6]" />
              <span>Brand Identity Details</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Business Name */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Website URL
                </label>
                <div className="relative flex items-center">
                  <Link2 className="absolute left-3.5 h-4 w-4 text-[#69718A]" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] py-2.5 pr-3.5 pl-10 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                Description / Pitch
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state your corporate profile, industry domain, key client targets..."
                className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Location */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Corporate Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Jakarta, Indonesia"
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="info@acme.com"
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-[#69718A] uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62 812..."
                  className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs text-[#202744] focus:border-[#8B6CF6] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#8B6CF6]/20"
                />
              </div>
            </div>

            {/* Visibility Settings Toggle */}
            <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-sans text-xs font-bold text-[#202744]">Listing Visibility Status</h5>
                  <p className="font-sans text-[11px] text-[#69718A]">Controls if your business profile catalog is visible to the public.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#EAE5DD] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                  <span className="ml-2.5 font-sans text-xs font-semibold text-[#202744]">{isPublic ? 'Public' : 'Hidden'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center space-x-2 rounded-xl bg-[#8B6CF6] px-6 py-2.5 font-sans text-xs font-bold text-white shadow-xs hover:bg-[#7A5CE0] transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Business Settings</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {activeTab === 'theme' && (
        <BusinessThemeTab businessProfile={profile} userId={profile?.userId || ''} />
      )}
    </div>
  );
};
