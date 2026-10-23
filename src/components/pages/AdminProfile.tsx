/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile, useUploadProfileImage, useUploadProfileBanner, useUploadProfileCV } from '../../hooks/useProfile';
import { getSessionPayload } from '../../lib/auth';
import { AccountSecuritySection } from '../molecules/AccountSecuritySection';
import { ProfileThemeTab } from '../organisms/ProfileThemeTab';
import { UserCheck, ShieldAlert, Loader2, Camera, Mail, Phone, MapPin, Sparkles, Tag, Plus, X, Globe, EyeOff, Lock, FileText, Upload, Download, Image as ImageIcon, Key, Copy, Check, ExternalLink, HelpCircle, Palette } from 'lucide-react';
export const AdminProfile: React.FC = () => {
    const { data: profile, isLoading, isError, error: fetchError } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const uploadImageMutation = useUploadProfileImage();
    const uploadBannerMutation = useUploadProfileBanner();
    const uploadCVMutation = useUploadProfileCV();

    // Get current user session for userId
    const session = getSessionPayload();
    const userId = session?.sub || '';
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

    // Copy to clipboard state
    const [copiedField, setCopiedField] = useState<string>('');
    const [showHowToUse, setShowHowToUse] = useState<boolean>(false);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedField(field);
            setTimeout(() => setCopiedField(''), 2000);
        });
    };

    // Fields State
    const [fullName, setFullName] = useState<string>('');
    const [headline, setHeadline] = useState<string>('');
    const [bio, setBio] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [contactEmail, setContactEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isPublic, setIsPublic] = useState<boolean>(true);

    // Tags list inputs
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState<string>('');
    const [services, setServices] = useState<string[]>([]);
    const [serviceInput, setServiceInput] = useState<string>('');

    // Messages
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isDownloadingCV, setIsDownloadingCV] = useState<boolean>(false);

    // Tracks if form values have been initialized from the profile query
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Populate form fields once profile data is loaded
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (profile && !isInitialized) {
            setFullName(profile.fullName || '');
            setHeadline(profile.headline || '');
            setBio(profile.bio || '');
            setLocation(profile.location || '');
            setContactEmail(profile.contactEmail || '');
            setPhoneNumber(profile.phoneNumber || '');
            setIsPublic(profile.isPublic ?? true);
            setSkills(profile.skills || []);
            setServices(profile.services || []);
            setIsInitialized(true);
        }
    }, [profile, isInitialized]);
    /* eslint-enable react-hooks/set-state-in-effect */


    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();
        const value = skillInput.trim();
        if (value && !skills.includes(value)) {
            setSkills([...skills, value]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleAddService = (e: React.FormEvent) => {
        e.preventDefault();
        const value = serviceInput.trim();
        if (value && !services.includes(value)) {
            setServices([...services, value]);
            setServiceInput('');
        }
    };

    const handleRemoveService = (service: string) => {
        setServices(services.filter(s => s !== service));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setErrorMsg('');
            setSuccessMsg('');
            uploadImageMutation.mutate(file, {
                onSuccess: () => {
                    setSuccessMsg('Profile photo updated successfully!');
                },
                onError: (err) => {
                    setErrorMsg(err.response?.data?.message || err.message || 'Image upload failed.');
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
                    setSuccessMsg('Profile banner updated successfully!');
                },
                onError: (err) => {
                    setErrorMsg(err.response?.data?.message || err.message || 'Banner upload failed.');
                }
            });
        }
    };

    const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setErrorMsg('');
            setSuccessMsg('');
            uploadCVMutation.mutate(file, {
                onSuccess: () => {
                    setSuccessMsg('CV document updated successfully!');
                },
                onError: (err) => {
                    setErrorMsg(err.response?.data?.message || err.message || 'CV upload failed.');
                }
            });
        }
    };

    const handleDownloadCV = async () => {
        if (!profile?.cvUrl) return;
        setIsDownloadingCV(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const response = await fetch(profile.cvUrl);
            if (!response.ok) throw new Error('Failed to fetch CV file.');
            const blob = await response.blob();

            // Detect extension from content type
            let extension = 'pdf'; // default fallback
            const contentType = response.headers.get('Content-Type');
            if (contentType) {
                if (contentType.includes('pdf')) {
                    extension = 'pdf';
                } else if (contentType.includes('wordprocessingml') || contentType.includes('docx')) {
                    extension = 'docx';
                } else if (contentType.includes('msword') || contentType.includes('doc')) {
                    extension = 'doc';
                }
            }

            const nameSlug = profile.fullName ? profile.fullName.trim().replace(/\s+/g, '_') : 'Profile';
            const fileName = `CV_${nameSlug}.${extension}`;

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error: unknown) {
            console.error('Failed to download CV:', error);
            setErrorMsg('Failed to download CV. Please try viewing it directly instead.');
            // Fallback opening in new tab
            window.open(profile.cvUrl, '_blank', 'noopener,noreferrer');
        } finally {
            setIsDownloadingCV(false);
        }
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!fullName.trim()) {
            setErrorMsg('Full Name is required.');
            return;
        }

        updateProfileMutation.mutate({
            fullName: fullName.trim(),
            headline: headline.trim() || undefined,
            bio: bio.trim() || undefined,
            location: location.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            isPublic,
            skills,
            services
        }, {
            onSuccess: () => {
                setSuccessMsg('Profile settings saved successfully!');
            },
            onError: (err) => {
                setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile settings.');
            }
        });
    };
    // Active tab state
    type ProfileTab = 'profile' | 'skills' | 'media' | 'theme' | 'security' | 'api';
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

    const tabs: { id: ProfileTab; label: string; icon: React.FC<{ className?: string }> }[] = [
        { id: 'profile', label: 'Profil', icon: UserCheck },
        { id: 'skills', label: 'Skills & Layanan', icon: Sparkles },
        { id: 'media', label: 'Media', icon: ImageIcon },
        { id: 'theme', label: 'Theme Portofolio', icon: Palette },
        { id: 'security', label: 'Keamanan', icon: Lock },
        { id: 'api', label: 'API Access', icon: Key },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-450">
                <Loader2 className="h-10 w-10 animate-spin text-slate-500 mb-3" />
                <p className="font-sans text-sm">Querying developer profile...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-start space-x-3 rounded-xl border border-red-150 bg-red-50 p-5 text-red-650 font-sans">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                    <h3 className="text-sm font-bold">Profile Load Failed</h3>
                    <p className="mt-1 text-xs text-red-500">{fetchError?.response?.data?.message || fetchError?.message || 'Check connection to backend server.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-[#EAE5DD] pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8E0FF] text-[#8B6CF6] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                            <UserCheck className="w-3 h-3" />
                            <span>Developer Identity</span>
                        </div>
                        <h2 className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#202744]">
                            My Developer Profile Settings
                        </h2>
                        <p className="font-sans text-xs text-[#69718A] mt-1">
                            Modify your identity fields, biography summary, skill sets, and visibility status.
                        </p>
                    </div>

                    {profile && userId && (
                        <a
                            href={`/portfolio/${userId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#EAE5DD] bg-white text-xs font-bold text-[#202744] hover:bg-[#FAF8F5] hover:border-[#8B6CF6]/40 transition shadow-xs self-start sm:self-auto cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-[#8B6CF6]" />
                            <span>Live Portfolio</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1.5 rounded-xl bg-[#F1ECE4]/70 p-1.5 overflow-x-auto border border-[#EAE5DD]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 font-sans text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                isActive
                                    ? 'bg-white text-[#202744] shadow-xs border border-[#EAE5DD]'
                                    : 'text-[#69718A] hover:text-[#202744] hover:bg-white/60 border border-transparent'
                            }`}
                        >
                            <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#8B6CF6]' : 'text-[#69718A]'}`} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Messages panel — always visible */}
            {successMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs font-sans text-emerald-800 font-bold flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="flex items-start space-x-2 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-sans text-rose-800 font-bold shadow-xs animate-in fade-in duration-200">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: Profil                                     */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                        {/* Left Profile Card */}
                        <div className="lg:col-span-4">
                            <div className="relative rounded-2xl border border-[#EAE5DD] bg-white shadow-xs overflow-hidden flex flex-col items-center text-center pb-5">
                                {/* Banner */}
                                <div className="w-full h-24 bg-[#FAF8F5] border-b border-[#EAE5DD] relative">
                                    {profile?.bannerImage ? (
                                        <img src={profile.bannerImage} alt="Banner Background" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-r from-[#FAF8F5] to-[#E8E0FF]/40 flex items-center justify-center text-[#8B6CF6]/40">
                                            <ImageIcon className="h-6 w-6 stroke-1" />
                                        </div>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="relative group -mt-12">
                                    <img
                                        src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                        alt={fullName || 'Avatar'}
                                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-85 transition"
                                    />
                                    <label className="absolute inset-0 flex items-center justify-center bg-[#202744]/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="h-5 w-5" />
                                        <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadImageMutation.isPending} className="sr-only" />
                                    </label>
                                    {uploadImageMutation.isPending && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#202744]/70 text-white rounded-full">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <h3 className="mt-4 font-sans text-base font-extrabold text-[#202744] leading-snug">{fullName || 'No Name Set'}</h3>
                                <p className="mt-1 font-sans text-xs text-[#69718A] font-medium">{headline || 'Creative Developer / Architect'}</p>

                                <div className="mt-3.5 inline-flex items-center space-x-1.5 rounded-full bg-[#FAF8F5] border border-[#EAE5DD] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#69718A]">
                                    {isPublic ? (
                                        <><Globe className="h-3 w-3 text-[#8B6CF6]" /><span className="text-[#202744]">Public Profile</span></>
                                    ) : (
                                        <><EyeOff className="h-3 w-3 text-[#69718A]" /><span>Private Link</span></>
                                    )}
                                </div>

                                <div className="m-5 w-full border-t border-[#EAE5DD] p-4 text-left space-y-2.5 font-sans text-xs text-[#69718A]">
                                    {location && (
                                        <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-[#8B6CF6] shrink-0" /><span className="truncate text-[#202744]">{location}</span></div>
                                    )}
                                    {contactEmail && (
                                        <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-[#4697F5] shrink-0" /><span className="truncate text-[#202744]">{contactEmail}</span></div>
                                    )}
                                    {phoneNumber && (
                                        <div className="flex items-center space-x-2"><Phone className="h-4 w-4 text-emerald-500 shrink-0" /><span className="truncate text-[#202744]">{phoneNumber}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Identity Form */}
                        <div className="lg:col-span-8 space-y-5">
                            <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-5">
                                <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-[#202744] flex items-center space-x-2 border-b border-[#EAE5DD] pb-3">
                                    <UserCheck className="h-4 w-4 text-[#8B6CF6]" />
                                    <span>Identity Settings</span>
                                </h4>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sarah Doe" className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1.5">Professional Headline</label>
                                        <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Lead Frontend Architect" className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1.5">Biography Summary</label>
                                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Detail your areas of expertise, focus technologies, and history..." className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] min-h-[90px] transition-all" />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1.5">Location Station</label>
                                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bandung, ID" className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1.5">Contact Email</label>
                                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="sarah@example.com" className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1.5">Contact Phone</label>
                                        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+62 811..." className="w-full rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all" />
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="font-sans text-xs font-bold text-[#202744]">Showcase Visibility Status</h5>
                                            <p className="font-sans text-[11px] text-[#69718A]">Controls if your profile node is public and queryable by guests.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer select-none">
                                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B6CF6]"></div>
                                            <span className="ml-2.5 font-sans text-xs font-bold text-[#202744]">{isPublic ? 'Public' : 'Hidden'}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button type="submit" disabled={updateProfileMutation.isPending} className="flex items-center space-x-2 rounded-xl bg-[#8B6CF6] px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#7857ED] transition active:scale-[0.98] disabled:opacity-60 cursor-pointer">
                                    {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <span>Save Profile Settings</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: Skills & Layanan                           */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'skills' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-6">
                        <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-[#202744] flex items-center space-x-2 border-b border-[#EAE5DD] pb-3">
                            <Sparkles className="h-4 w-4 text-[#8B6CF6]" />
                            <span>Skills & Services Offerings</span>
                        </h4>

                        {/* Skills */}
                        <div className="space-y-3">
                            <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1">Developer Expertise Skills</label>
                            <div className="flex gap-2">
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g. Kubernetes, React Query, TypeScript" className="flex-1 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all" />
                                <button type="button" onClick={handleAddSkill} className="px-4 bg-[#FAF8F5] border border-[#EAE5DD] hover:bg-[#E8E0FF]/50 hover:border-[#8B6CF6]/40 text-[#202744] font-bold uppercase tracking-wider text-[11px] rounded-xl transition flex items-center space-x-1 cursor-pointer">
                                    <Plus className="h-3.5 w-3.5 text-[#8B6CF6]" /><span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1.5">
                                {skills.length === 0 ? (
                                    <span className="font-sans text-xs text-[#69718A] italic">No expertise skills recorded.</span>
                                ) : (
                                    skills.map((skill, index) => (
                                        <span key={index} className="inline-flex items-center space-x-1.5 rounded-lg bg-[#E8E0FF]/60 border border-[#8B6CF6]/20 px-2.5 py-1 font-mono text-[10px] font-bold text-[#8B6CF6]">
                                            <Tag className="h-3 w-3 text-[#8B6CF6]" />
                                            <span>{skill}</span>
                                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 transition ml-1 cursor-pointer"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-3 border-t border-[#EAE5DD] pt-5">
                            <label className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-1">Services Provided</label>
                            <div className="flex gap-2">
                                <input type="text" value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} placeholder="e.g. Website Consulting, API Development" className="flex-1 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-3.5 py-2.5 font-sans text-xs focus:border-[#8B6CF6] focus:bg-white focus:ring-2 focus:ring-[#8B6CF6]/15 focus:outline-hidden text-[#202744] transition-all" />
                                <button type="button" onClick={handleAddService} className="px-4 bg-[#FAF8F5] border border-[#EAE5DD] hover:bg-[#E8E0FF]/50 hover:border-[#8B6CF6]/40 text-[#202744] font-bold uppercase tracking-wider text-[11px] rounded-xl transition flex items-center space-x-1 cursor-pointer">
                                    <Plus className="h-3.5 w-3.5 text-[#8B6CF6]" /><span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1.5">
                                {services.length === 0 ? (
                                    <span className="font-sans text-xs text-[#69718A] italic">No services listed yet.</span>
                                ) : (
                                    services.map((service, index) => (
                                        <span key={index} className="inline-flex items-center space-x-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 font-sans text-xs font-semibold text-blue-700">
                                            <span>{service}</span>
                                            <button type="button" onClick={() => handleRemoveService(service)} className="hover:text-red-500 transition ml-1 cursor-pointer"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button type="submit" disabled={updateProfileMutation.isPending} className="flex items-center space-x-2 rounded-xl bg-[#8B6CF6] px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#7857ED] transition active:scale-[0.98] disabled:opacity-60 cursor-pointer">
                            {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            <span>Save Profile Settings</span>
                        </button>
                    </div>
                </form>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: Media                                      */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'media' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Profile Photo */}
                    <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-4">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#202744] flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-[#8B6CF6]" />
                            <span>Profile Photo</span>
                        </h4>
                        <div className="flex items-center space-x-5">
                            <div className="relative group shrink-0">
                                <img
                                    src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                    alt={fullName || 'Avatar'}
                                    className="h-20 w-20 rounded-full object-cover border-2 border-[#EAE5DD] group-hover:opacity-85 transition"
                                />
                                <label className="absolute inset-0 flex items-center justify-center bg-[#202744]/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-5 w-5" />
                                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadImageMutation.isPending} className="sr-only" />
                                </label>
                                {uploadImageMutation.isPending && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#202744]/60 text-white rounded-full">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-sans text-xs font-bold text-[#202744]">Foto Profil</p>
                                <p className="font-sans text-[11px] text-[#69718A] mt-0.5">Hover pada gambar untuk mengganti foto profil.</p>
                            </div>
                        </div>
                    </div>

                    {/* Banner Image */}
                    <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-4">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#202744] flex items-center space-x-2">
                            <ImageIcon className="h-4 w-4 text-[#4697F5]" />
                            <span>Profile Banner</span>
                        </h4>
                        <div className="relative group/banner rounded-xl overflow-hidden border border-[#EAE5DD] bg-[#FAF8F5] h-32 flex items-center justify-center">
                            {profile?.bannerImage ? (
                                <img src={profile.bannerImage} alt="Profile Banner" className="h-full w-full object-cover" />
                            ) : (
                                <div className="text-[#69718A] flex flex-col items-center text-center p-2">
                                    <ImageIcon className="h-8 w-8 stroke-1 mb-1 text-[#8B6CF6]/40" />
                                    <span className="font-sans text-[10px] uppercase tracking-wider">No Banner Image</span>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-[#202744]/40 text-white flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition duration-150 cursor-pointer">
                                <Camera className="h-5 w-5 mr-1.5" />
                                <span className="font-sans text-xs font-bold uppercase tracking-wider">Change Banner</span>
                                <input type="file" accept="image/*" onChange={handleBannerChange} disabled={uploadBannerMutation.isPending} className="sr-only" />
                            </label>
                            {uploadBannerMutation.isPending && (
                                <div className="absolute inset-0 bg-[#202744]/60 text-white flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Curriculum Vitae */}
                    <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-4 lg:col-span-2">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#202744] flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-[#FFC45B]" />
                            <span>Curriculum Vitae (CV)</span>
                        </h4>
                        <div className="flex items-center justify-between p-4 rounded-xl border border-[#EAE5DD] bg-[#FAF8F5]">
                            <div className="flex items-center space-x-3 min-w-0">
                                <FileText className="h-8 w-8 text-[#8B6CF6] shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-sans text-xs font-bold text-[#202744] truncate">
                                        {profile?.cvUrl ? 'CV Document Uploaded' : 'No CV Uploaded'}
                                    </p>
                                    <p className="font-sans text-[11px] text-[#69718A]">
                                        {profile?.cvUrl ? 'PDF / Word format ready for recruiters' : 'Upload PDF or Word document'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                                {profile?.cvUrl && (
                                    <button
                                        type="button"
                                        onClick={handleDownloadCV}
                                        disabled={isDownloadingCV}
                                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EAE5DD] hover:bg-[#FAF8F5] text-[#202744] font-sans text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-xs"
                                    >
                                        {isDownloadingCV ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-[#8B6CF6]" />}
                                        <span>Download</span>
                                    </button>
                                )}
                                <label className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#8B6CF6] text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#7857ED] transition cursor-pointer shadow-xs">
                                    <Upload className="h-3.5 w-3.5" />
                                    <span>Upload CV</span>
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVChange} disabled={uploadCVMutation.isPending} className="sr-only" />
                                </label>
                            </div>
                        </div>
                        {uploadCVMutation.isPending && (
                            <div className="flex items-center space-x-2 text-xs text-[#8B6CF6] font-sans">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8B6CF6]" />
                                <span>Uploading CV document...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: Theme Portofolio                          */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'theme' && (
                <ProfileThemeTab profile={profile} userId={userId} />
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: Keamanan                                   */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'security' && (
                <AccountSecuritySection />
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: API Access                                 */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'api' && (
                <div className="max-w-3xl space-y-6">
                    <div className="rounded-2xl border border-[#EAE5DD] bg-white p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between border-b border-[#EAE5DD] pb-4">
                            <div>
                                <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-[#202744] flex items-center space-x-2">
                                    <Key className="h-4 w-4 text-[#8B6CF6]" />
                                    <span>API Access & Public Endpoints</span>
                                </h4>
                                <p className="font-sans text-xs text-[#69718A] mt-1">
                                    Build your own frontend. Let Foliowalaweh handle your portfolio backend.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowHowToUse(true)}
                                className="flex items-center space-x-1.5 rounded-xl px-3 py-1.5 font-sans text-xs font-bold text-[#8B6CF6] bg-[#E8E0FF]/60 border border-[#8B6CF6]/20 hover:bg-[#E8E0FF] transition cursor-pointer shrink-0 ml-3"
                            >
                                <HelpCircle className="h-3.5 w-3.5" />
                                <span>How to Use</span>
                            </button>
                        </div>

                        {/* User ID */}
                        <div className="space-y-1.5">
                            <span className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider">User ID</span>
                            <div className="flex items-center justify-between rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-4 py-2.5">
                                <code className="font-mono text-xs text-[#202744] truncate flex-1 select-all">{userId || '—'}</code>
                                <button type="button" onClick={() => handleCopy(userId, 'userId')} className="ml-2 text-[#69718A] hover:text-[#8B6CF6] transition shrink-0 cursor-pointer" title="Copy User ID">
                                    {copiedField === 'userId' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Base URL */}
                        <div className="space-y-1.5">
                            <span className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider">Base URL</span>
                            <div className="flex items-center justify-between rounded-xl border border-[#EAE5DD] bg-[#FAF8F5] px-4 py-2.5">
                                <code className="font-mono text-xs text-[#202744] truncate flex-1 select-all">{baseUrl || '—'}</code>
                                <button type="button" onClick={() => handleCopy(baseUrl, 'baseUrl')} className="ml-2 text-[#69718A] hover:text-[#8B6CF6] transition shrink-0 cursor-pointer" title="Copy Base URL">
                                    {copiedField === 'baseUrl' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Public Endpoints */}
                        <div className="border-t border-[#EAE5DD] pt-4">
                            <span className="block font-sans text-[11px] font-bold text-[#202744] uppercase tracking-wider mb-3">Public Endpoints</span>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'Profile', path: `/profiles/${userId}`, key: 'ep-profile' },
                                    { label: 'Experiences', path: `/experiences/public/${userId}`, key: 'ep-experiences' },
                                    { label: 'Experience Detail', path: `/experiences/public/${userId}/<ID>`, key: 'ep-experience-detail' },
                                    { label: 'Projects', path: `/projects/public/${userId}`, key: 'ep-projects' },
                                    { label: 'Project Detail', path: `/projects/public/${userId}/<ID>`, key: 'ep-project-detail' },
                                    { label: 'Full Portfolio', path: `/portfolio/${userId}`, key: 'ep-portfolio' },
                                    { label: 'Business Profile', path: `/business-profiles/${userId}`, key: 'ep-business-profile' },
                                    { label: 'Business Projects', path: `/business-projects/public/${userId}`, key: 'ep-business-projects' },
                                    { label: 'Business Project Detail', path: `/business-projects/public/${userId}/<ID>`, key: 'ep-business-project-detail' },
                                    { label: 'Business Services', path: `/business-services/public/${userId}`, key: 'ep-business-services' },
                                    { label: 'Business Service Detail', path: `/business-services/public/${userId}/<ID>`, key: 'ep-business-service-detail' },
                                ].map((ep) => {
                                    const fullUrl = `${baseUrl}${ep.path}`;
                                    return (
                                        <div key={ep.key} className="rounded-xl border border-[#EAE5DD] bg-[#FAF8F5]/80 px-4 py-2.5 space-y-1 transition hover:bg-white hover:border-[#8B6CF6]/30">
                                            <div className="flex items-center justify-between">
                                                <span className="font-sans text-[11px] font-bold text-[#202744] flex items-center space-x-1.5">
                                                    <Globe className="h-3.5 w-3.5 text-[#8B6CF6]" />
                                                    <span>{ep.label}</span>
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                    <button type="button" onClick={() => handleCopy(fullUrl, ep.key)} className="text-[#69718A] hover:text-[#8B6CF6] transition cursor-pointer" title="Copy endpoint URL">
                                                        {copiedField === ep.key ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </button>
                                                    <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-[#69718A] hover:text-[#4697F5] transition" title="Open in browser">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                            <code className="block font-mono text-[10px] text-[#69718A] truncate select-all">
                                                <span className="inline-block rounded bg-emerald-50 border border-emerald-200 text-emerald-700 px-1.5 py-0.5 mr-1.5 font-bold text-[9px]">GET</span>
                                                {fullUrl}
                                            </code>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* How to Use Modal (global, shown from API tab) */}
            {showHowToUse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowHowToUse(false)}>
                    <div className="absolute inset-0 bg-[#202744]/40 backdrop-blur-xs" />
                    <div
                        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#EAE5DD] bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-1 bg-linear-to-r from-[#8B6CF6] via-[#4697F5] to-[#FFC45B]" />
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <HelpCircle className="h-5 w-5 text-[#8B6CF6]" />
                                    <h3 className="font-sans text-base font-extrabold tracking-tight text-[#202744]">Cara Menggunakan Portfolio API</h3>
                                </div>
                                <button type="button" onClick={() => setShowHowToUse(false)} className="rounded-lg p-1.5 text-[#69718A] hover:text-[#202744] hover:bg-[#FAF8F5] transition cursor-pointer">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="font-sans text-xs text-[#69718A] leading-relaxed">
                                Semua endpoint public bisa diakses tanpa autentikasi. Cukup gunakan <strong>Base URL</strong> + <strong>endpoint path</strong> untuk mengambil data portfolio kamu.
                            </p>

                            {/* cURL */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#202744]">📟 cURL</span>
                                    <button type="button" onClick={() => handleCopy(`curl ${baseUrl}/portfolio/${userId}`, 'curl-example')} className="text-[#69718A] hover:text-[#8B6CF6] transition cursor-pointer" title="Copy">
                                        {copiedField === 'curl-example' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                                <div className="rounded-xl bg-[#202744] p-3.5 overflow-x-auto text-white">
                                    <code className="font-mono text-xs text-emerald-400 whitespace-pre">{`curl ${baseUrl}/portfolio/${userId}`}</code>
                                </div>
                            </div>

                            {/* JavaScript Fetch */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#202744]">⚡ JavaScript (fetch)</span>
                                    <button type="button" onClick={() => handleCopy(`const response = await fetch('${baseUrl}/portfolio/${userId}');\nconst data = await response.json();\nconsole.log(data);`, 'fetch-example')} className="text-[#69718A] hover:text-[#8B6CF6] transition cursor-pointer" title="Copy">
                                        {copiedField === 'fetch-example' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                                <div className="rounded-xl bg-[#202744] p-3.5 overflow-x-auto text-white">
                                    <pre className="font-mono text-xs text-sky-400 whitespace-pre">{`const response = await fetch('${baseUrl}/portfolio/${userId}');\nconst data = await response.json();\nconsole.log(data);`}</pre>
                                </div>
                            </div>

                            {/* React/Next.js */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#202744]">⚛️ React / Next.js</span>
                                    <button type="button" onClick={() => handleCopy(`// Ambil semua experiences public\nconst res = await fetch('${baseUrl}/experiences/public/${userId}');\nconst experiences = await res.json();\n\n// Ambil semua projects public\nconst res2 = await fetch('${baseUrl}/projects/public/${userId}');\nconst projects = await res2.json();`, 'react-example')} className="text-[#69718A] hover:text-[#8B6CF6] transition cursor-pointer" title="Copy">
                                        {copiedField === 'react-example' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                                <div className="rounded-xl bg-[#202744] p-3.5 overflow-x-auto text-white">
                                    <pre className="font-mono text-xs text-[#FFC45B] whitespace-pre">{`// Ambil semua experiences public\nconst res = await fetch('${baseUrl}/experiences/public/${userId}');\nconst experiences = await res.json();\n\n// Ambil semua projects public\nconst res2 = await fetch('${baseUrl}/projects/public/${userId}');\nconst projects = await res2.json();`}</pre>
                                </div>
                            </div>

                            {/* Endpoints Table */}
                            <div className="space-y-2">
                                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#202744]">📋 Daftar Endpoint</span>
                                <div className="rounded-2xl border border-[#EAE5DD] overflow-hidden bg-white shadow-3xs">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#FAF8F5]/85 border-b border-[#EAE5DD]">
                                                <th className="font-sans text-[11px] font-semibold text-[#69718A] px-4 py-3">Endpoint</th>
                                                <th className="font-sans text-[11px] font-semibold text-[#69718A] px-4 py-3">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F3EFEA] text-xs font-sans text-[#202744]">
                                            <tr className="transition-colors hover:bg-[#8B6CF6]/[0.035]">
                                                <td className="px-4 py-3"><code className="font-mono text-[10px] text-[#8B6CF6] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">{'{baseUrl}'}/profiles/{'{userId}'}</code></td>
                                                <td className="px-4 py-3 text-xs text-[#69718A]">Data profil public (nama, bio, skills, dll)</td>
                                            </tr>
                                            <tr className="transition-colors hover:bg-[#8B6CF6]/[0.035]">
                                                <td className="px-4 py-3"><code className="font-mono text-[10px] text-[#8B6CF6] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">{'{baseUrl}'}/experiences/public/{'{userId}'}</code></td>
                                                <td className="px-4 py-3 text-xs text-[#69718A]">Daftar pengalaman kerja public</td>
                                            </tr>
                                            <tr className="transition-colors hover:bg-[#8B6CF6]/[0.035]">
                                                <td className="px-4 py-3"><code className="font-mono text-[10px] text-[#8B6CF6] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">{'{baseUrl}'}/projects/public/{'{userId}'}</code></td>
                                                <td className="px-4 py-3 text-xs text-[#69718A]">Daftar project public</td>
                                            </tr>
                                            <tr className="transition-colors hover:bg-[#8B6CF6]/[0.035]">
                                                <td className="px-4 py-3"><code className="font-mono text-[10px] text-[#8B6CF6] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">{'{baseUrl}'}/portfolio/{'{userId}'}</code></td>
                                                <td className="px-4 py-3 text-xs text-[#69718A]">Semua data portfolio lengkap</td>
                                            </tr>
                                            <tr className="transition-colors hover:bg-[#8B6CF6]/[0.035]">
                                                <td className="px-4 py-3"><code className="font-mono text-[10px] text-[#8B6CF6] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">{'{baseUrl}'}/business-profiles/{'{userId}'}</code></td>
                                                <td className="px-4 py-3 text-xs text-[#69718A]">Data profil bisnis public</td>
                                            </tr>
                                            <tr className="transition-colors hover:bg-[#8B6CF6]/[0.035]">
                                                <td className="px-4 py-3"><code className="font-mono text-[10px] text-[#8B6CF6] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">{'{baseUrl}'}/business-projects/public/{'{userId}'}</code></td>
                                                <td className="px-4 py-3 text-xs text-[#69718A]">Daftar project bisnis public</td>
                                            </tr>
                                            <tr className="transition-colors hover:bg-[#8B6CF6]/[0.035]">
                                                <td className="px-4 py-3"><code className="font-mono text-[10px] text-[#8B6CF6] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE5DD]">{'{baseUrl}'}/business-services/public/{'{userId}'}</code></td>
                                                <td className="px-4 py-3 text-xs text-[#69718A]">Daftar layanan bisnis public</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="rounded-xl bg-[#E8E0FF]/40 border border-[#8B6CF6]/20 p-3.5 space-y-1">
                                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#8B6CF6]">💡 Tips Developer</span>
                                <ul className="font-sans text-xs text-[#202744] space-y-1 list-disc list-inside leading-relaxed">
                                    <li>Semua endpoint public <strong>tidak memerlukan token / autentikasi</strong>.</li>
                                    <li>Response dalam format <strong>JSON standard</strong>.</li>
                                    <li>Hanya data yang diset <strong>public</strong> yang akan tampil di endpoint ini.</li>
                                </ul>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={() => setShowHowToUse(false)} className="flex items-center space-x-2 rounded-xl bg-[#8B6CF6] px-5 py-2 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#7857ED] transition active:scale-[0.98] cursor-pointer">
                                    <span>Tutup Panduan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
