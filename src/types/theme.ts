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
  | 'CUSTOM_BANNER'
  | 'CLIENTS_LOGO'
  | 'COMPANY_STATS'
  | 'PROCESS_WORKFLOW'
  | 'TESTIMONIALS'
  | 'FAQ_ACCORDION'
  | 'CTA_BANNER';

// ─── Business Section Prop Models ──────────────────────────────────────────

export interface ClientLogoItem {
  id?: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface ClientsLogoProps {
  title?: string;
  subtitle?: string;
  logos: ClientLogoItem[];
}

export interface TestimonialItem {
  id?: string;
  clientName: string;
  clientRole?: string;
  clientCompany?: string;
  avatarUrl?: string;
  rating?: number;
  content: string;
}

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials: TestimonialItem[];
}

export interface CompanyStatItem {
  id?: string;
  value: string;
  label: string;
  description?: string;
}

export interface CompanyStatsProps {
  title?: string;
  subtitle?: string;
  stats: CompanyStatItem[];
}

export interface ProcessStepItem {
  id?: string;
  step: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ProcessWorkflowProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStepItem[];
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  title?: string;
  subtitle?: string;
  faqs: FaqItem[];
}

export interface CtaBannerProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export interface ThemeTokens {
  fontFamily: string;
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  surfaceColor?: string;
  textColor?: string;
  textSecondaryColor?: string;
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

export type TemplateType = 'BUILDER' | 'CUSTOM_HTML';

export interface LayoutConfig {
  templateType?: TemplateType;
  customHtml?: string;
  customCss?: string;
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
