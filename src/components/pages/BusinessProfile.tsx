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
  Globe, EyeOff, Image as ImageIcon, Link2, Copy, Check
} from 'lucide-react';

export const BusinessProfilePage: React.FC = () => {
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-450">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500 mb-3" />
        <p className="font-sans text-sm">Querying business settings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-start space-x-3 rounded-xl border border-red-150 bg-red-50 p-5 text-red-650 font-sans">
        <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold">Business Profile Load Failed</h3>
          <p className="mt-1 text-xs text-red-500">
            {fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="font-sans text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
          Business Profile Configuration
        </h2>
        <p className="font-sans text-xs text-neutral-450 mt-1">
          Define your brand parameters, contact information, location, and visibility showcase details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Media Assets (Logo & Banner) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden flex flex-col items-center text-center pb-5">
            {/* Banner Background */}
            <div className="w-full h-24 bg-slate-100 border-b border-slate-200 relative">
              {profile?.bannerImage ? (
                <img
                  src={profile.bannerImage}
                  alt="Business Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-r from-slate-50 to-slate-100 flex items-center justify-center text-slate-350">
                  <ImageIcon className="h-6 w-6 stroke-1" />
                </div>
              )}
            </div>

            {/* Logo Container */}
            <div className="relative group -mt-12">
              <img
                src={profile?.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200'}
                alt={businessName || 'Business Logo'}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-2xs group-hover:opacity-85 transition bg-white"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={uploadLogoMutation.isPending}
                  className="sr-only"
                />
              </label>
              {uploadLogoMutation.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </div>

            <h3 className="mt-4 px-3 font-sans text-base font-bold text-slate-900 leading-snug">
              {businessName || 'Corporate Catalog'}
            </h3>
            <p className="mt-1.5 px-4 font-sans text-xs text-slate-450 line-clamp-2">
              {description || 'Establish your corporate identity summary...'}
            </p>

            <div className="mt-3.5 inline-flex items-center space-x-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
              {isPublic ? (
                <>
                  <Globe className="h-3 w-3 text-slate-500" />
                  <span>Public Listing</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 text-slate-400" />
                  <span>Hidden Listing</span>
                </>
              )}
            </div>

            {profile?.userId && (
              <div className="mt-4 px-5 w-full">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between font-mono text-[10px] text-slate-600 text-left">
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
                    {copiedUserId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="m-5 w-full border-t border-slate-100 p-4 text-left space-y-2.5 font-sans text-xs text-slate-500">
              {location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {contactEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{contactEmail}</span>
                </div>
              )}
              {phoneNumber && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Banner Media Asset box */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-slate-500" />
              <span>Banner Management</span>
            </h4>
            <div className="space-y-2">
              <div className="relative group/banner rounded-md overflow-hidden border border-slate-200 bg-slate-50 h-24 flex items-center justify-center">
                {profile?.bannerImage ? (
                  <img
                    src={profile.bannerImage}
                    alt="Corporate Banner Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-slate-350 flex flex-col items-center text-center p-2">
                    <ImageIcon className="h-6 w-6 stroke-1 mb-1" />
                    <span className="font-sans text-[8px] uppercase tracking-wider">No Banner Image</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition duration-150 cursor-pointer">
                  <Camera className="h-5 w-5 mr-1.5" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Change Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    disabled={uploadBannerMutation.isPending}
                    className="sr-only"
                  />
                </label>
                {uploadBannerMutation.isPending && (
                  <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
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
            <div className="rounded-md border border-green-150 bg-green-50 p-4 text-xs font-sans text-green-700 font-bold">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs font-sans text-red-655 font-bold">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
            <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>Brand Identity Details</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Business Name */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Website URL
                </label>
                <div className="relative flex items-center">
                  <Link2 className="absolute left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://acme.com"
                    className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-3 pl-9.5 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description / Pitch
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state your corporate profile, industry domain, key client targets..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Location */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Corporate Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Jakarta, Indonesia"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="info@acme.com"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62 812..."
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            {/* Visibility Settings Toggle */}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-sans text-xs font-bold text-slate-900">Listing Visibility Status</h5>
                  <p className="font-sans text-[11px] text-slate-400">Controls if your business profile catalog is visible to the public.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  <span className="ml-2.5 font-sans text-xs font-bold text-slate-700">{isPublic ? 'Public' : 'Hidden'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center space-x-2 rounded-md bg-black px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save Business Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
