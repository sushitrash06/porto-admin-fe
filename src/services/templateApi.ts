/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { api } from '../lib/api';
import type {
  Template,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  UserCustomConfig,
  LayoutConfig,
  TemplateCategory,
} from '../types/theme';

export interface AdminTemplateQueryParams {
  search?: string;
  category?: TemplateCategory;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminTemplateListResponse {
  data: Template[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const templateApi = {
  // ─── ADMIN ENDPOINTS (Require Role: ADMIN) ───────────────────────────────────

  // 1. Ambil semua template (draft & published) dengan pagination & filter
  getAllAdmin: async (params?: AdminTemplateQueryParams): Promise<AdminTemplateListResponse> => {
    const res = await api.get('/admin/templates', { params });
    return res.data;
  },

  // 2. Ambil detail template untuk di-load ke Builder canvas
  getByIdAdmin: async (id: string): Promise<Template> => {
    const res = await api.get(`/admin/templates/${id}`);
    return res.data;
  },

  // 3. Simpan template baru hasil builder
  create: async (payload: CreateTemplatePayload): Promise<Template> => {
    const res = await api.post('/admin/templates', payload);
    return res.data;
  },

  // 4. Update susunan layout / config template
  update: async (id: string, payload: UpdateTemplatePayload): Promise<Template> => {
    const res = await api.patch(`/admin/templates/${id}`, payload);
    return res.data;
  },

  // 5. Toggle publish/unpublish
  togglePublish: async (id: string, isPublished: boolean): Promise<Template> => {
    const res = await api.patch(`/admin/templates/${id}/publish`, { isPublished });
    return res.data;
  },

  // 6. Duplikasi / Clone template
  clone: async (id: string): Promise<Template> => {
    const res = await api.post(`/admin/templates/${id}/clone`);
    return res.data;
  },

  // 7. Upload thumbnail screenshot template
  uploadThumbnail: async (id: string, file: File): Promise<Template> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/admin/templates/${id}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // 8. Hapus template
  delete: async (id: string): Promise<{ message?: string }> => {
    const res = await api.delete(`/admin/templates/${id}`);
    return res.data;
  },

  // ─── USER & PUBLIC ENDPOINTS ────────────────────────────────────────────────

  // Ambil list template yang siap dipakai user
  getPublishedTemplates: async (category?: TemplateCategory): Promise<Template[]> => {
    const res = await api.get('/templates', { params: { category } });
    return res.data;
  },

  // Detail preview template publik
  getPublishedDetail: async (idOrSlug: string): Promise<Template> => {
    const res = await api.get(`/templates/${idOrSlug}`);
    return res.data;
  },

  // Ambil template aktif, userCustomConfig, dan resolvedLayout user yang sedang login
  getMyTheme: async (): Promise<{
    template: Template;
    userCustomConfig: UserCustomConfig | null;
    resolvedLayout: LayoutConfig;
  }> => {
    const res = await api.get('/templates/me');
    return res.data;
  },

  // User mengadopsi template ke profilnya (1-click apply)
  applyTemplate: async (templateId: string): Promise<{ message: string; template: Template }> => {
    const res = await api.patch('/templates/me/apply', { templateId });
    return res.data;
  },

  // User geser-geser urutan section portofolionya sendiri (Drag & Drop)
  reorderSections: async (sectionIds: string[]): Promise<{ message: string; resolvedLayout?: LayoutConfig }> => {
    const res = await api.patch('/templates/me/reorder-sections', { sectionIds });
    return res.data;
  },

  // User kustomisasi warna aksen / sembunyikan section
  updateUserThemeConfig: async (payload: UserCustomConfig): Promise<{ message: string }> => {
    const res = await api.patch('/templates/me/theme-config', payload);
    return res.data;
  },

  // User reset kustomisasi kembali ke tampilan asli template bawaan
  resetThemeConfig: async (): Promise<{ message: string }> => {
    const res = await api.post('/templates/me/reset');
    return res.data;
  },

  // ─── BUSINESS PROFILE THEME ENDPOINTS ───────────────────────────────────────

  // 1. Ambil template aktif, userCustomConfig, dan resolvedLayout untuk profil bisnis
  getMyBusinessTheme: async (): Promise<{
    template: Template;
    userCustomConfig: UserCustomConfig | null;
    resolvedLayout: LayoutConfig;
  }> => {
    const res = await api.get('/templates/business/me');
    return res.data;
  },

  // 2. Terapkan template ke profil bisnis (1-click apply)
  applyBusinessTemplate: async (templateId: string): Promise<{ message: string; template: Template }> => {
    const res = await api.patch('/templates/business/me/apply', { templateId });
    return res.data;
  },

  // 3. Reorder section profil bisnis (Drag & Drop)
  reorderBusinessSections: async (sectionIds: string[]): Promise<{ message: string; resolvedLayout?: LayoutConfig }> => {
    const res = await api.patch('/templates/business/me/reorder-sections', { sectionIds });
    return res.data;
  },

  // 4. Update kustomisasi warna aksen / dark mode / visibility profil bisnis
  updateBusinessThemeConfig: async (payload: UserCustomConfig): Promise<{ message: string }> => {
    const res = await api.patch('/templates/business/me/theme-config', payload);
    return res.data;
  },

  // 5. Reset kustomisasi profil bisnis ke default template bawaan
  resetBusinessThemeConfig: async (): Promise<{ message: string }> => {
    const res = await api.post('/templates/business/me/reset');
    return res.data;
  },

  // ─── RICH SECTION CONTENT PROPS & ASSETS ───────────────────────────────────

  // Update spesifik 1 section (props, title, isVisible) untuk profil personal
  updateUserSection: async (sectionId: string, payload: {
    title?: string;
    variant?: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }) => {
    const res = await api.patch(`/templates/me/sections/${sectionId}`, payload);
    return res.data;
  },

  // Update spesifik 1 section (props, title, isVisible) untuk profil bisnis
  updateBusinessSection: async (sectionId: string, payload: {
    title?: string;
    variant?: string;
    isVisible?: boolean;
    props?: Record<string, any>;
  }) => {
    const res = await api.patch(`/templates/business/me/sections/${sectionId}`, payload);
    return res.data;
  },

  // Upload aset gambar untuk custom blocks (logo klien, foto review, avatar)
  uploadThemeAsset: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/templates/upload-asset', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Aktivasi profil bisnis untuk user personal yang sedang login
  activateBusinessProfile: async (payload: {
    businessName: string;
    description?: string;
    contactEmail?: string;
    phoneNumber?: string;
    location?: string;
    website?: string;
  }) => {
    const res = await api.post('/business-profiles', payload);
    return res.data;
  },
};

export default templateApi;
