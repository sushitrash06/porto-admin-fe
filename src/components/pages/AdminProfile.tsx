/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile, useUploadProfileImage, useUploadProfileBanner, useUploadProfileCV } from '../../hooks/useProfile';
import { useChangePassword } from '../../hooks/useLogin';
import { getSessionPayload } from '../../lib/auth';
import { UserCheck, ShieldAlert, Loader2, Camera, Mail, Phone, MapPin, Sparkles, Tag, Plus, X, Globe, EyeOff, Lock, FileText, Upload, Download, Image as ImageIcon, Key, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
export const AdminProfile: React.FC = () => {
    const { data: profile, isLoading, isError, error: fetchError } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const uploadImageMutation = useUploadProfileImage();
    const uploadBannerMutation = useUploadProfileBanner();
    const uploadCVMutation = useUploadProfileCV();
    const changePasswordMutation = useChangePassword();

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

    // Change password fields state
    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');

    // Tracks if form values have been initialized from the profile query
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // Populate form fields once profile data is loaded
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
        } catch (error: any) {
            console.error('Failed to download CV:', error);
            setErrorMsg('Failed to download CV. Please try viewing it directly instead.');
            // Fallback opening in new tab
            window.open(profile.cvUrl, '_blank', 'noopener,noreferrer');
        } finally {
            setIsDownloadingCV(false);
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (newPassword.length < 6) {
            setErrorMsg('New password must be at least 6 characters long.');
            return;
        }

        changePasswordMutation.mutate({
            oldPassword,
            newPassword
        }, {
            onSuccess: () => {
                setSuccessMsg('Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
            },
            onError: (err) => {
                setErrorMsg(err.response?.data?.message || err.message || 'Failed to change password.');
            }
        });
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
    type ProfileTab = 'profile' | 'skills' | 'media' | 'security' | 'api';
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

    const tabs: { id: ProfileTab; label: string; icon: React.FC<{ className?: string }> }[] = [
        { id: 'profile', label: 'Profil', icon: UserCheck },
        { id: 'skills', label: 'Skills & Layanan', icon: Sparkles },
        { id: 'media', label: 'Media', icon: ImageIcon },
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
        <div className="space-y-5">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
                <h2 className="font-sans text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
                    My Developer Profile Settings
                </h2>
                <p className="font-sans text-xs text-neutral-450 mt-1">
                    Modify your identity fields, biography summary, skill sets, and visibility status.
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-1.5 rounded-md px-3.5 py-2 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                isActive
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Messages panel — always visible */}
            {successMsg && (
                <div className="rounded-md border border-green-150 bg-green-50 p-4 text-xs font-sans text-green-700 font-bold">
                    {successMsg}
                </div>
            )}
            {errorMsg && (
                <div className="flex items-start space-x-2 rounded-md border border-red-100 bg-red-50 p-4 text-xs font-sans text-red-650 font-bold">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
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
                            <div className="relative rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden flex flex-col items-center text-center pb-5">
                                {/* Banner */}
                                <div className="w-full h-24 bg-slate-100 border-b border-slate-200 relative">
                                    {profile?.bannerImage ? (
                                        <img src={profile.bannerImage} alt="Banner Background" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-r from-slate-50 to-slate-100 flex items-center justify-center text-slate-300">
                                            <ImageIcon className="h-6 w-6 stroke-1" />
                                        </div>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="relative group -mt-12">
                                    <img
                                        src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                        alt={fullName || 'Avatar'}
                                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-2xs group-hover:opacity-85 transition"
                                    />
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="h-5 w-5" />
                                        <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadImageMutation.isPending} className="sr-only" />
                                    </label>
                                    {uploadImageMutation.isPending && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <h3 className="mt-4 font-sans text-base font-bold text-slate-900 leading-snug">{fullName || 'No Name Set'}</h3>
                                <p className="mt-1 font-sans text-xs text-slate-450 font-medium">{headline || 'Creative Developer / Architect'}</p>

                                <div className="mt-3.5 inline-flex items-center space-x-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                    {isPublic ? (
                                        <><Globe className="h-3 w-3 text-slate-500" /><span>Public Profile</span></>
                                    ) : (
                                        <><EyeOff className="h-3 w-3 text-slate-400" /><span>Private Link</span></>
                                    )}
                                </div>

                                <div className="m-5 w-full border-t border-slate-100 p-4 text-left space-y-2.5 font-sans text-xs text-slate-500">
                                    {location && (
                                        <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-slate-400 shrink-0" /><span className="truncate">{location}</span></div>
                                    )}
                                    {contactEmail && (
                                        <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-slate-400 shrink-0" /><span className="truncate">{contactEmail}</span></div>
                                    )}
                                    {phoneNumber && (
                                        <div className="flex items-center space-x-2"><Phone className="h-4 w-4 text-slate-400 shrink-0" /><span className="truncate">{phoneNumber}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Identity Form */}
                        <div className="lg:col-span-8 space-y-5">
                            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
                                <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                                    <UserCheck className="h-4 w-4 text-slate-500" />
                                    <span>Identity Settings</span>
                                </h4>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
                                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Sarah Doe" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Professional Headline</label>
                                        <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Lead Devops Architect" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Biography Summary</label>
                                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Detail your areas of expertise, focus technologies, and history..." className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[90px]" />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location Station</label>
                                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bandung, ID" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Email</label>
                                        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="sarah@example.com" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</label>
                                        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+62 811..." className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="rounded-md border border-slate-250 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="font-sans text-xs font-bold text-slate-900">Showcase Visibility Status</h5>
                                            <p className="font-sans text-[11px] text-slate-400">Controls if your profile node is public and queryable by guests.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer select-none">
                                            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                            <span className="ml-2.5 font-sans text-xs font-bold text-slate-700">{isPublic ? 'Public' : 'Hidden'}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex justify-end">
                                <button type="submit" disabled={updateProfileMutation.isPending} className="flex items-center space-x-2 rounded-md bg-black px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer">
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
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-6">
                        <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                            <Sparkles className="h-4 w-4 text-slate-500" />
                            <span>Skills & Services Offerings</span>
                        </h4>

                        {/* Skills */}
                        <div className="space-y-3">
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Developer Expertise Skills</label>
                            <div className="flex gap-2">
                                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="e.g. Kubernetes, React Query" className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                                <button type="button" onClick={handleAddSkill} className="px-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-md transition flex items-center space-x-1">
                                    <Plus className="h-3.5 w-3.5" /><span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {skills.length === 0 ? (
                                    <span className="font-sans text-xs text-slate-350 italic">No expertise skills recorded.</span>
                                ) : (
                                    skills.map((skill, index) => (
                                        <span key={index} className="inline-flex items-center space-x-1 rounded bg-slate-50 border border-slate-200 px-2 py-1 font-mono text-[9px] font-bold text-slate-500">
                                            <Tag className="h-2.5 w-2.5 text-slate-400" />
                                            <span>{skill}</span>
                                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-650 transition ml-1"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-3">
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Services Provided</label>
                            <div className="flex gap-2">
                                <input type="text" value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} placeholder="e.g. Website Consulting, API Development" className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                                <button type="button" onClick={handleAddService} className="px-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-md transition flex items-center space-x-1">
                                    <Plus className="h-3.5 w-3.5" /><span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {services.length === 0 ? (
                                    <span className="font-sans text-xs text-slate-350 italic">No services listed yet.</span>
                                ) : (
                                    services.map((service, index) => (
                                        <span key={index} className="inline-flex items-center space-x-1 rounded bg-slate-50 border border-slate-200 px-2 py-1 font-sans text-[9px] font-bold text-slate-500">
                                            <span>{service}</span>
                                            <button type="button" onClick={() => handleRemoveService(service)} className="hover:text-red-650 transition ml-1"><X className="h-3 w-3" /></button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button type="submit" disabled={updateProfileMutation.isPending} className="flex items-center space-x-2 rounded-md bg-black px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer">
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
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-4">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-slate-500" />
                            <span>Profile Photo</span>
                        </h4>
                        <div className="flex items-center space-x-5">
                            <div className="relative group shrink-0">
                                <img
                                    src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                    alt={fullName || 'Avatar'}
                                    className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 group-hover:opacity-85 transition"
                                />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="h-5 w-5" />
                                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadImageMutation.isPending} className="sr-only" />
                                </label>
                                {uploadImageMutation.isPending && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-sans text-xs font-bold text-slate-700">Foto Profil</p>
                                <p className="font-sans text-[10px] text-slate-400 mt-0.5">Hover pada gambar untuk mengganti foto.</p>
                            </div>
                        </div>
                    </div>

                    {/* Banner Image */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-4">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                            <ImageIcon className="h-4 w-4 text-slate-500" />
                            <span>Profile Banner</span>
                        </h4>
                        <div className="relative group/banner rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center">
                            {profile?.bannerImage ? (
                                <img src={profile.bannerImage} alt="Profile Banner" className="h-full w-full object-cover" />
                            ) : (
                                <div className="text-slate-350 flex flex-col items-center text-center p-2">
                                    <ImageIcon className="h-8 w-8 stroke-1 mb-1" />
                                    <span className="font-sans text-[10px] uppercase tracking-wider">No Banner Image</span>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition duration-150 cursor-pointer">
                                <Camera className="h-5 w-5 mr-1.5" />
                                <span className="font-sans text-[10px] font-bold uppercase tracking-wider">Change Banner</span>
                                <input type="file" accept="image/*" onChange={handleBannerChange} disabled={uploadBannerMutation.isPending} className="sr-only" />
                            </label>
                            {uploadBannerMutation.isPending && (
                                <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Curriculum Vitae */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-4 lg:col-span-2">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span>Curriculum Vitae (CV)</span>
                        </h4>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                            <div className="flex items-center space-x-3 min-w-0">
                                <FileText className="h-8 w-8 text-red-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-sans text-xs font-bold text-slate-700 truncate">
                                        {profile?.cvUrl ? 'CV Document Uploaded' : 'No CV Uploaded'}
                                    </p>
                                    <p className="font-sans text-[10px] text-slate-400">
                                        {profile?.cvUrl ? 'PDF format available' : 'Upload PDF file'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                                {profile?.cvUrl && (
                                    <button
                                        type="button"
                                        onClick={handleDownloadCV}
                                        disabled={isDownloadingCV}
                                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-sans text-[10px] font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {isDownloadingCV ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                                        <span>Download</span>
                                    </button>
                                )}
                                <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-black text-white font-sans text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer">
                                    <Upload className="h-3.5 w-3.5" />
                                    <span>Upload</span>
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCVChange} disabled={uploadCVMutation.isPending} className="sr-only" />
                                </label>
                            </div>
                        </div>
                        {uploadCVMutation.isPending && (
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-sans">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                                <span>Uploading CV document...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: Keamanan                                   */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'security' && (
                <div className="max-w-xl">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
                        <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                            <Lock className="h-4 w-4 text-slate-500" />
                            <span>Security Credentials</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Password</label>
                                <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                            </div>
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={changePasswordMutation.isPending || !oldPassword || !newPassword}
                                className="flex items-center space-x-2 rounded-md bg-black px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-3xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                            >
                                {changePasswordMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                <span>Update Password</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* TAB: API Access                                 */}
            {/* ═══════════════════════════════════════════════ */}
            {activeTab === 'api' && (
                <div className="max-w-2xl space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
                        <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                            <Key className="h-4 w-4 text-slate-500" />
                            <span>API Access & Public Endpoints</span>
                        </h4>

                        <div className="flex items-center justify-between">
                            <p className="font-sans text-xs text-slate-400 leading-relaxed flex-1">
                                Gunakan informasi di bawah untuk mengakses data portfolio public kamu via API.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowHowToUse(true)}
                                className="flex items-center space-x-1 rounded-md px-2.5 py-1.5 font-sans text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer shrink-0 ml-3"
                            >
                                <HelpCircle className="h-3 w-3" />
                                <span>How to Use</span>
                            </button>
                        </div>

                        {/* User ID */}
                        <div className="space-y-1.5">
                            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">User ID</span>
                            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                                <code className="font-mono text-xs text-slate-700 truncate flex-1 select-all">{userId || '—'}</code>
                                <button type="button" onClick={() => handleCopy(userId, 'userId')} className="ml-2 text-slate-400 hover:text-slate-700 transition shrink-0 cursor-pointer" title="Copy User ID">
                                    {copiedField === 'userId' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Base URL */}
                        <div className="space-y-1.5">
                            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base URL</span>
                            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                                <code className="font-mono text-xs text-slate-700 truncate flex-1 select-all">{baseUrl || '—'}</code>
                                <button type="button" onClick={() => handleCopy(baseUrl, 'baseUrl')} className="ml-2 text-slate-400 hover:text-slate-700 transition shrink-0 cursor-pointer" title="Copy Base URL">
                                    {copiedField === 'baseUrl' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Public Endpoints */}
                        <div className="border-t border-slate-100 pt-4">
                            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Public Endpoints</span>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'Profile', path: `/profiles/${userId}`, key: 'ep-profile' },
                                    { label: 'Experiences', path: `/experiences/public/${userId}`, key: 'ep-experiences' },
                                    { label: 'Projects', path: `/projects/public/${userId}`, key: 'ep-projects' },
                                    { label: 'Full Portfolio', path: `/portfolio/${userId}`, key: 'ep-portfolio' },
                                ].map((ep) => {
                                    const fullUrl = `${baseUrl}${ep.path}`;
                                    return (
                                        <div key={ep.key} className="rounded-lg border border-slate-150 bg-slate-50/50 px-4 py-2.5 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                                                    <Globe className="h-3 w-3 text-slate-400" />
                                                    <span>{ep.label}</span>
                                                </span>
                                                <div className="flex items-center space-x-1.5">
                                                    <button type="button" onClick={() => handleCopy(fullUrl, ep.key)} className="text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Copy endpoint URL">
                                                        {copiedField === ep.key ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </button>
                                                    <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700 transition" title="Open in browser">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            </div>
                                            <code className="block font-mono text-[10px] text-slate-500 truncate select-all">
                                                <span className="inline-block rounded bg-emerald-50 border border-emerald-200 text-emerald-700 px-1 py-0.5 mr-1.5 font-bold text-[8px]">GET</span>
                                                {ep.path}
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
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-1 bg-gradient-to-r from-black via-slate-700 to-black" />
                        <div className="p-6 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <HelpCircle className="h-5 w-5 text-slate-700" />
                                    <h3 className="font-sans text-base font-bold tracking-tight text-slate-900">Cara Menggunakan API</h3>
                                </div>
                                <button type="button" onClick={() => setShowHowToUse(false)} className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="font-sans text-xs text-slate-500 leading-relaxed">
                                Semua endpoint public bisa diakses tanpa autentikasi. Cukup gunakan <strong>Base URL</strong> + <strong>endpoint path</strong> untuk mengambil data portfolio kamu.
                            </p>

                            {/* cURL */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-700">📟 cURL</span>
                                    <button type="button" onClick={() => handleCopy(`curl ${baseUrl}/portfolio/${userId}`, 'curl-example')} className="text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Copy">
                                        {copiedField === 'curl-example' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                                <div className="rounded-lg bg-slate-900 p-3.5 overflow-x-auto">
                                    <code className="font-mono text-[10px] text-emerald-400 whitespace-pre">{`curl ${baseUrl}/portfolio/${userId}`}</code>
                                </div>
                            </div>

                            {/* JavaScript Fetch */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-700">⚡ JavaScript (fetch)</span>
                                    <button type="button" onClick={() => handleCopy(`const response = await fetch('${baseUrl}/portfolio/${userId}');\nconst data = await response.json();\nconsole.log(data);`, 'fetch-example')} className="text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Copy">
                                        {copiedField === 'fetch-example' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                                <div className="rounded-lg bg-slate-900 p-3.5 overflow-x-auto">
                                    <pre className="font-mono text-[10px] text-sky-400 whitespace-pre">{`const response = await fetch('${baseUrl}/portfolio/${userId}');\nconst data = await response.json();\nconsole.log(data);`}</pre>
                                </div>
                            </div>

                            {/* React/Next.js */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-700">⚛️ React / Next.js</span>
                                    <button type="button" onClick={() => handleCopy(`// Ambil semua experiences public\nconst res = await fetch('${baseUrl}/experiences/public/${userId}');\nconst experiences = await res.json();\n\n// Ambil semua projects public\nconst res2 = await fetch('${baseUrl}/projects/public/${userId}');\nconst projects = await res2.json();`, 'react-example')} className="text-slate-400 hover:text-slate-700 transition cursor-pointer" title="Copy">
                                        {copiedField === 'react-example' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                </div>
                                <div className="rounded-lg bg-slate-900 p-3.5 overflow-x-auto">
                                    <pre className="font-mono text-[10px] text-amber-400 whitespace-pre">{`// Ambil semua experiences public\nconst res = await fetch('${baseUrl}/experiences/public/${userId}');\nconst experiences = await res.json();\n\n// Ambil semua projects public\nconst res2 = await fetch('${baseUrl}/projects/public/${userId}');\nconst projects = await res2.json();`}</pre>
                                </div>
                            </div>

                            {/* Endpoints Table */}
                            <div className="space-y-2">
                                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-700">📋 Daftar Endpoint</span>
                                <div className="rounded-lg border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="font-sans text-[9px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">Endpoint</th>
                                                <th className="font-sans text-[9px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr>
                                                <td className="px-3 py-2"><code className="font-mono text-[9px] text-slate-600">/profiles/{'{userId}'}</code></td>
                                                <td className="px-3 py-2 font-sans text-[10px] text-slate-500">Data profil public (nama, bio, skills, dll)</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2"><code className="font-mono text-[9px] text-slate-600">/experiences/public/{'{userId}'}</code></td>
                                                <td className="px-3 py-2 font-sans text-[10px] text-slate-500">Daftar pengalaman kerja public</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2"><code className="font-mono text-[9px] text-slate-600">/projects/public/{'{userId}'}</code></td>
                                                <td className="px-3 py-2 font-sans text-[10px] text-slate-500">Daftar project public</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2"><code className="font-mono text-[9px] text-slate-600">/portfolio/{'{userId}'}</code></td>
                                                <td className="px-3 py-2 font-sans text-[10px] text-slate-500">Semua data portfolio lengkap</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 space-y-1">
                                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-amber-700">💡 Tips</span>
                                <ul className="font-sans text-[10px] text-amber-700 space-y-1 list-disc list-inside leading-relaxed">
                                    <li>Semua endpoint public <strong>tidak memerlukan token/autentikasi</strong>.</li>
                                    <li>Response dalam format <strong>JSON</strong>.</li>
                                    <li>Hanya data yang kamu set <strong>public</strong> yang akan muncul.</li>
                                    <li>Untuk detail experience/project, tambahkan <code className="bg-amber-100 px-1 rounded text-[9px]">/{'experienceId'}</code> atau <code className="bg-amber-100 px-1 rounded text-[9px]">/{'projectId'}</code> di akhir URL.</li>
                                </ul>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={() => setShowHowToUse(false)} className="flex items-center space-x-2 rounded-md bg-black px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer">
                                    <span>Mengerti</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
