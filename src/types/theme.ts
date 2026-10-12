/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TemplateCategory =
  | 'DEVELOPER'
  | 'DESIGNER'
  | 'BUSINESS'
  | 'CREATIVE'
  | 'MINIMAL'
  | 'OTHER';

export type BlockType =
  | 'HERO_PROFILE'
  | 'ABOUT_ME'
  | 'PROJECT_LIST'
  | 'EXPERIENCE_TIMELINE'
  | 'SKILLS_LIST'
  | 'SERVICES_GRID'
  | 'CONTACT_SECTION'
  | 'CUSTOM_BANNER';

export interface ThemeTokens {
  fontFamily: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  surfaceColor?: string;
  textColor?: string;
  borderRadius?: string;
  darkMode?: boolean;
}

export interface SectionBlock {
  id: string;
  type: BlockType | string;
  title?: string;
  variant?: string;
  isVisible: boolean;
  props?: Record<string, unknown>;
}

export interface LayoutConfig {
  theme: ThemeTokens;
  sections: SectionBlock[];
}

export interface UserCustomConfig {
  theme?: Partial<ThemeTokens>;
  sections?: Array<{
    id: string;
    isVisible?: boolean;
    props?: Record<string, unknown>;
  }>;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: TemplateCategory;
  isPublished: boolean;
  isDefault: boolean;
  version: number;
  layoutConfig: LayoutConfig;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    profiles: number;
  };
}

export interface CreateTemplatePayload {
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category?: TemplateCategory;
  isPublished?: boolean;
  isDefault?: boolean;
  layoutConfig: LayoutConfig;
}

export interface UpdateTemplatePayload {
  slug?: string;
  name?: string;
  description?: string;
  thumbnail?: string;
  category?: TemplateCategory;
  isPublished?: boolean;
  isDefault?: boolean;
  layoutConfig?: LayoutConfig;
}
