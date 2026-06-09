/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile, useUploadProfileImage, useUploadProfileBanner, useUploadProfileCV } from '../../hooks/useProfile';
import { useChangePassword } from '../../hooks/useLogin';
import { UserCheck, ShieldAlert, Loader2, Camera, Mail, Phone, MapPin, Sparkles, Tag, Plus, X, Globe, EyeOff, Lock, FileText, Upload, Download, Image as ImageIcon } from 'lucide-react';
export const AdminProfile: React.FC = () => {
    const { data: profile, isLoading, isError, error: fetchError } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const uploadImageMutation = useUploadProfileImage();
    const uploadBannerMutation = useUploadProfileBanner();
    const uploadCVMutation = useUploadProfileCV();
    const changePasswordMutation = useChangePassword();

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

    // Populate form fields once profile data is loaded
    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setHeadline(profile.headline || '');
            setBio(profile.bio || '');
            setLocation(profile.location || '');
            setContactEmail(profile.contactEmail || '');
            setPhoneNumber(profile.phoneNumber || '');
            setIsPublic(profile.isPublic ?? true);
            setSkills(profile.skills || []);
            setServices(profile.services || []);
        }
    }, [profile]);

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
            {/* Self-contained header display */}
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="font-sans text-lg font-extrabold tracking-tight text-neutral-900 uppercase">
                    My Developer Profile Settings
                </h2>
                <p className="font-sans text-xs text-neutral-450 mt-1">
                    Modify your identity fields, biography summary, skill sets, and visibility status.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                {/* Left Profile card/Avatar editor (4 columns) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="relative rounded-xl border border-slate-200 bg-white shadow-3xs overflow-hidden flex flex-col items-center text-center pb-5">

                        {/* Card Banner Background */}
                        <div className="w-full h-24 bg-slate-100 border-b border-slate-200 relative">
                            {profile?.bannerImage ? (
                                <img
                                    src={profile.bannerImage}
                                    alt="Banner Background"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-r from-slate-50 to-slate-100 flex items-center justify-center text-slate-300">
                                    <ImageIcon className="h-6 w-6 stroke-1" />
                                </div>
                            )}
                        </div>

                        {/* Avatar container */}
                        <div className="relative group -mt-12">
                            <img
                                src={profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                                alt={fullName || 'Avatar'}
                                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-2xs group-hover:opacity-85 transition"
                            />

                            {/* Upload overlay */}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="h-5 w-5" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={uploadImageMutation.isPending}
                                    className="sr-only"
                                />
                            </label>

                            {uploadImageMutation.isPending && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            )}
                        </div>

                        <h3 className="mt-4 font-sans text-base font-bold text-slate-900 leading-snug">
                            {fullName || 'No Name Set'}
                        </h3>
                        <p className="mt-1 font-sans text-xs text-slate-450 font-medium">
                            {headline || 'Creative Developer / Architect'}
                        </p>

                        <div className="mt-3.5 inline-flex items-center space-x-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            {isPublic ? (
                                <>
                                    <Globe className="h-3 w-3 text-slate-500" />
                                    <span>Public Profile</span>
                                </>
                            ) : (
                                <>
                                    <EyeOff className="h-3 w-3 text-slate-400" />
                                    <span>Private Link</span>
                                </>
                            )}
                        </div>

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

                    {/* Media Assets (Banner & CV) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs space-y-5">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                            <ImageIcon className="h-4 w-4 text-slate-500" />
                            <span>Media & Documents</span>
                        </h4>

                        {/* Banner Image */}
                        <div className="space-y-2">
                            <span className="block font-sans text-[10px] font-bold text-slate-455 uppercase tracking-wider">Profile Banner</span>
                            <div className="relative group/banner rounded-md overflow-hidden border border-slate-200 bg-slate-50 h-24 flex items-center justify-center">
                                {profile?.bannerImage ? (
                                    <img
                                        src={profile.bannerImage}
                                        alt="Profile Banner"
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

                        {/* Curriculum Vitae (CV) */}
                        <div className="space-y-2">
                            <span className="block font-sans text-[10px] font-bold text-slate-455 uppercase tracking-wider">Curriculum Vitae (CV)</span>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                                <div className="flex items-center space-x-2 min-w-0">
                                    <FileText className="h-6 w-6 text-red-500 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-sans text-[10px] font-bold text-slate-700 truncate">
                                            {profile?.cvUrl ? 'CV Document Uploaded' : 'No CV Uploaded'}
                                        </p>
                                        <p className="font-sans text-[8px] text-slate-400">
                                            {profile?.cvUrl ? 'PDF format available' : 'Upload PDF file'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0">
                                    {profile?.cvUrl && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleDownloadCV}
                                                disabled={isDownloadingCV}
                                                className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-black transition relative disabled:opacity-50"
                                                title="Download CV"
                                            >
                                                {isDownloadingCV ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Download className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </>
                                    )}
                                    <label className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-black transition cursor-pointer relative">
                                        <Upload className="h-3.5 w-3.5" />
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleCVChange}
                                            disabled={uploadCVMutation.isPending}
                                            className="sr-only"
                                        />
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
                </div>

                {/* Right Form Editor (8 columns) */}
                <form onSubmit={handleSaveProfile} className="lg:col-span-8 space-y-6">

                    {/* Messages panel */}
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

                    {/* Core details card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
                        <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                            <UserCheck className="h-4 w-4 text-slate-500" />
                            <span>Identity Settings</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Full Name */}
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Sarah Doe"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>

                            {/* Headline */}
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Professional Headline
                                </label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder="e.g. Lead Devops Architect"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Biography abstract */}
                        <div>
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Biography Summary
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Detail your areas of expertise, focus technologies, and history..."
                                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900 min-h-[90px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {/* Location */}
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Location Station
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Bandung, ID"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>

                            {/* Contact Email */}
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="sarah@example.com"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>

                            {/* Phone number */}
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Contact Phone
                                </label>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+62 811..."
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>
                        </div>

                        {/* Visibility Settings Toggle */}
                        <div className="rounded-md border border-slate-250 bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h5 className="font-sans text-xs font-bold text-slate-900">Showcase Visibility Status</h5>
                                    <p className="font-sans text-[11px] text-slate-400">Controls if your profile node is public and queryable by guests.</p>
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

                    {/* Skills and Services card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-6">
                        <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                            <Sparkles className="h-4 w-4 text-slate-500" />
                            <span>Skills & Services Offerings</span>
                        </h4>

                        {/* Skills */}
                        <div className="space-y-3">
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Developer Expertise Skills
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    placeholder="e.g. Kubernetes, React Query"
                                    className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="px-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-md transition flex items-center space-x-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {skills.length === 0 ? (
                                    <span className="font-sans text-xs text-slate-350 italic">No expertise skills recorded.</span>
                                ) : (
                                    skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center space-x-1 rounded bg-slate-50 border border-slate-200 px-2 py-1 font-mono text-[9px] font-bold text-slate-500"
                                        >
                                            <Tag className="h-2.5 w-2.5 text-slate-400" />
                                            <span>{skill}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="hover:text-red-650 transition ml-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-3">
                            <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Services Provided
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={serviceInput}
                                    onChange={(e) => setServiceInput(e.target.value)}
                                    placeholder="e.g. Website Consulting, API Development"
                                    className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddService}
                                    className="px-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] rounded-md transition flex items-center space-x-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>Add</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {services.length === 0 ? (
                                    <span className="font-sans text-xs text-slate-350 italic">No services listed yet.</span>
                                ) : (
                                    services.map((service, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center space-x-1 rounded bg-slate-50 border border-slate-200 px-2 py-1 font-sans text-[9px] font-bold text-slate-500"
                                        >
                                            <span>{service}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveService(service)}
                                                className="hover:text-red-650 transition ml-1"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password change card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-3xs space-y-5">
                        <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
                            <Lock className="h-4 w-4 text-slate-500" />
                            <span>Security Credentials</span>
                        </h4>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Old Password */}
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min 6 characters"
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-sans text-xs focus:border-slate-400 focus:bg-white focus:outline-hidden text-slate-900"
                                />
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

                    {/* Submit Actions */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="flex items-center space-x-2 rounded-md bg-black px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                        >
                            {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            <span>Save Profile Settings</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};
