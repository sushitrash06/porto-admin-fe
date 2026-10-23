/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, Globe, Monitor, Tablet, Smartphone, Palette,
  Sparkles, Loader2, Upload, FileText, Code, FileCode,
  Maximize2, Check, Copy, RefreshCw, Sun, Moon
} from 'lucide-react';
import type { AxiosError } from 'axios';
import {
  useAdminTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useUploadTemplateThumbnail,
} from '../../hooks/useTemplates';
import type {
  TemplateCategory,
  ThemeTokens,
  LayoutConfig,
  Template,
} from '../../types/theme';
import { DynamicPortfolioRenderer } from '../organisms/DynamicPortfolioRenderer';
import { ResponsiveSimulatorFrame } from '../organisms/ResponsiveSimulatorFrame';

// ─── Default Starter Template ────────────────────────────────────────────────
const DEFAULT_HTML_BOILERPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{fullName}} - Portfolio</title>
</head>
<body>
  <!-- Navigation Header -->
  <header class="navbar">
    <div class="nav-container">
      <div class="logo">{{fullName}}</div>
      <nav class="nav-links">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="mailto:{{email}}" class="btn-contact">Contact</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section id="about" class="hero-section">
    <div class="hero-container">
      <div class="hero-avatar-wrapper">
        <img src="{{avatar}}" alt="{{fullName}}" class="hero-avatar" />
        <span class="status-badge">Available for hire</span>
      </div>
      <h1 class="hero-title">
        Hi, I'm <span class="text-gradient">{{fullName}}</span>
      </h1>
      <p class="hero-headline">{{headline}}</p>
      <p class="hero-bio">{{bio}}</p>
      <div class="hero-actions">
        <a href="mailto:{{email}}" class="btn-primary">Get In Touch &rarr;</a>
        <a href="#projects" class="btn-secondary">View Featured Work</a>
      </div>
    </div>
  </section>

  <!-- Skills Section -->
  <section id="skills" class="section">
    <div class="section-container">
      <h2 class="section-title">Tech Stack & Competencies</h2>
      <div class="skills-grid">
        {{#each skills}}
          <span class="skill-pill">{{this}}</span>
        {{/each}}
      </div>
    </div>
  </section>

  <!-- Featured Projects Section -->
  <section id="projects" class="section">
    <div class="section-container">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        {{#each projects}}
          <div class="project-card">
            <div class="project-thumbnail-wrapper">
              <img src="{{thumbnail}}" alt="{{title}}" class="project-thumbnail" />
            </div>
            <div class="project-content">
              <span class="project-role">{{role}}</span>
              <h3 class="project-title">{{title}}</h3>
              <p class="project-desc">{{description}}</p>
              <div class="project-links">
                <a href="{{projectUrl}}" target="_blank" class="project-link">Live Demo &rarr;</a>
                <a href="{{githubUrl}}" target="_blank" class="project-link secondary">Source Code</a>
              </div>
            </div>
          </div>
        {{/each}}
      </div>
    </div>
  </section>

  <!-- Experience Timeline -->
  <section id="experience" class="section">
    <div class="section-container">
      <h2 class="section-title">Career Experience</h2>
      <div class="experience-timeline">
        {{#each experiences}}
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="timeline-header">
                <h3 class="timeline-position">{{position}}</h3>
                <span class="timeline-dates">{{startDate}} - {{endDate}}</span>
              </div>
              <h4 class="timeline-company">{{company}}</h4>
              <p class="timeline-desc">{{description}}</p>
            </div>
          </div>
        {{/each}}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <p>&copy; 2026 {{fullName}}. Built with Foliowalaweh.</p>
  </footer>
</body>
</html>`;

const DEFAULT_CSS_BOILERPLATE = `/* ═════════════════════════════════════════════════════════════════════════════
   Dynamic CSS Variables injected from Theme Palette:
   --primary, --secondary, --bg, --surface, --text, --text-secondary, --radius
   ═════════════════════════════════════════════════════════════════════════════ */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg, #0F172A);
  color: var(--text, #F8FAFC);
  font-family: inherit;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: var(--surface, #1E293B);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 1.5rem;
  backdrop-filter: blur(8px);
}
.nav-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--text, #F8FAFC);
  letter-spacing: -0.5px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-links a {
  color: var(--text-secondary, #94A3B8);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.2s;
}
.nav-links a:hover {
  color: var(--primary, #8B6CF6);
}
.btn-contact {
  padding: 0.5rem 1rem;
  border-radius: var(--radius, 12px);
  background-color: var(--primary, #8B6CF6);
  color: #ffffff !important;
  transition: opacity 0.2s;
}
.btn-contact:hover {
  opacity: 0.9;
}

/* Hero Section */
.hero-section {
  padding: 5rem 1.5rem 4rem;
  text-align: center;
  background: radial-gradient(circle at 50% 0%, rgba(139, 108, 246, 0.15) 0%, transparent 70%);
}
.hero-container {
  max-width: 800px;
  margin: 0 auto;
}
.hero-avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}
.hero-avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--primary, #8B6CF6);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}
.status-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #10B981;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  border: 2px solid var(--bg, #0F172A);
  text-transform: uppercase;
}
.hero-title {
  font-size: 2.75rem;
  font-weight: 900;
  letter-spacing: -1px;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}
.text-gradient {
  background: linear-gradient(135deg, var(--primary, #8B6CF6), var(--secondary, #4697F5));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-headline {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary, #8B6CF6);
  margin-bottom: 1rem;
}
.hero-bio {
  font-size: 1rem;
  color: var(--text-secondary, #94A3B8);
  max-width: 620px;
  margin: 0 auto 2rem;
  line-height: 1.7;
}
.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius, 12px);
  background-color: var(--primary, #8B6CF6);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(139, 108, 246, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 108, 246, 0.6);
}
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius, 12px);
  background-color: var(--surface, #1E293B);
  color: var(--text, #F8FAFC);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

/* Sections */
.section {
  padding: 4rem 1.5rem;
}
.section-container {
  max-width: 1000px;
  margin: 0 auto;
}
.section-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 2rem;
  position: relative;
  display: inline-block;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 40px;
  height: 3px;
  background-color: var(--primary, #8B6CF6);
  border-radius: 9999px;
}

/* Skills */
.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.skill-pill {
  padding: 0.5rem 1rem;
  border-radius: var(--radius, 12px);
  background-color: var(--surface, #1E293B);
  color: var(--text, #F8FAFC);
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: border-color 0.2s, transform 0.2s;
}
.skill-pill:hover {
  border-color: var(--primary, #8B6CF6);
  transform: translateY(-2px);
}

/* Projects */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.project-card {
  background-color: var(--surface, #1E293B);
  border-radius: var(--radius, 12px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.project-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary, #8B6CF6);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}
.project-thumbnail-wrapper {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}
.project-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.project-card:hover .project-thumbnail {
  transform: scale(1.05);
}
.project-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.project-role {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--secondary, #4697F5);
  margin-bottom: 0.25rem;
}
.project-title {
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: var(--text, #F8FAFC);
}
.project-desc {
  font-size: 0.875rem;
  color: var(--text-secondary, #94A3B8);
  margin-bottom: 1.25rem;
  line-height: 1.6;
  flex: 1;
}
.project-links {
  display: flex;
  gap: 1rem;
}
.project-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary, #8B6CF6);
  text-decoration: none;
  transition: opacity 0.2s;
}
.project-link:hover {
  text-decoration: underline;
}
.project-link.secondary {
  color: var(--text-secondary, #94A3B8);
}

/* Timeline */
.experience-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  padding-left: 1.5rem;
  margin-left: 0.5rem;
}
.timeline-item {
  position: relative;
}
.timeline-dot {
  position: absolute;
  left: -1.95rem;
  top: 0.5rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--primary, #8B6CF6);
  border: 3px solid var(--bg, #0F172A);
}
.timeline-card {
  background-color: var(--surface, #1E293B);
  border-radius: var(--radius, 12px);
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}
.timeline-position {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text, #F8FAFC);
}
.timeline-dates {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--secondary, #4697F5);
}
.timeline-company {
  font-size: 0.875rem;
  color: var(--primary, #8B6CF6);
  margin-bottom: 0.5rem;
}
.timeline-desc {
  font-size: 0.875rem;
  color: var(--text-secondary, #94A3B8);
  line-height: 1.6;
}

/* Footer */
.footer {
  text-align: center;
  padding: 3rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.8rem;
  color: var(--text-secondary, #94A3B8);
}`;

const DEFAULT_THEME: ThemeTokens = {
  fontFamily: 'Inter',
  primaryColor: '#8B6CF6',
  secondaryColor: '#4697F5',
  backgroundColor: '#0F172A',
  surfaceColor: '#1E293B',
  textColor: '#F8FAFC',
  textSecondaryColor: '#94A3B8',
  borderRadius: '12px',
  darkMode: true,
};

const COLOR_PRESETS = [
  {
    name: 'Violet Dream',
    primary: '#8B6CF6',
    secondary: '#4697F5',
    bg: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    dark: true,
  },
  {
    name: 'Emerald Tech',
    primary: '#10B981',
    secondary: '#06B6D4',
    bg: '#062016',
    surface: '#0B2E21',
    text: '#ECFDF5',
    textSecondary: '#6EE7B7',
    dark: true,
  },
  {
    name: 'Cyberpunk Neon',
    primary: '#F43F5E',
    secondary: '#8B5CF6',
    bg: '#0D0D15',
    surface: '#181826',
    text: '#FFFFFF',
    textSecondary: '#A5B4FC',
    dark: true,
  },
  {
    name: 'Midnight Gold',
    primary: '#F59E0B',
    secondary: '#D97706',
    bg: '#14120E',
    surface: '#242018',
    text: '#FFFBEB',
    textSecondary: '#FCD34D',
    dark: true,
  },
  {
    name: 'Clean Light',
    primary: '#2563EB',
    secondary: '#3B82F6',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    dark: false,
  },
];

const DYNAMIC_PLACEHOLDERS = [
  { tag: '{{fullName}}', desc: 'Nama lengkap user / profil' },
  { tag: '{{headline}}', desc: 'Judul profesi / headline' },
  { tag: '{{bio}}', desc: 'Biografi singkat' },
  { tag: '{{avatar}}', desc: 'URL foto profil' },
  { tag: '{{location}}', desc: 'Lokasi (kota, negara)' },
  { tag: '{{email}}', desc: 'Email kontak' },
  { tag: '{{phone}}', desc: 'Nomor telepon' },
  { tag: '{{cvUrl}}', desc: 'URL resume / CV' },
  { tag: '{{#each skills}}{{this}}{{/each}}', desc: 'Loop daftar keahlian' },
  { tag: '{{#each projects}}...{{/each}}', desc: 'Loop proyek ({{title}}, {{description}}, {{thumbnail}}, {{projectUrl}}, {{githubUrl}}, {{role}})' },
  { tag: '{{#each experiences}}...{{/each}}', desc: 'Loop riwayat karir ({{company}}, {{position}}, {{description}}, {{startDate}}, {{endDate}})' },
  { tag: 'var(--primary)', desc: 'CSS var warna aksen utama' },
  { tag: 'var(--secondary)', desc: 'CSS var warna aksen kedua' },
  { tag: 'var(--bg)', desc: 'CSS var warna latar belakang' },
  { tag: 'var(--surface)', desc: 'CSS var warna kartu / container' },
  { tag: 'var(--text)', desc: 'CSS var warna teks utama' },
  { tag: 'var(--text-secondary)', desc: 'CSS var warna teks sekunder' },
  { tag: 'var(--radius)', desc: 'CSS var radius sudut (border-radius)' },
];

interface TemplateStudioEditorProps {
  existingTemplate?: Template | null;
  templateId?: string;
}

const TemplateStudioEditor: React.FC<TemplateStudioEditorProps> = ({
  existingTemplate,
  templateId,
}) => {
  const isEditing = !!templateId;
  const navigate = useNavigate();

  // Queries & Mutations
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const uploadThumbnailMutation = useUploadTemplateThumbnail();

  // Metadata State
  const [name, setName] = useState<string>(existingTemplate?.name || 'Modern Developer Showcase');
  const [slug, setSlug] = useState<string>(existingTemplate?.slug || 'modern-developer');
  const [description, setDescription] = useState<string>(
    existingTemplate?.description || 'Clean and versatile layout for software engineers and architects'
  );
  const [category, setCategory] = useState<TemplateCategory>(existingTemplate?.category || 'DEVELOPER');
  const [isPublished, setIsPublished] = useState<boolean>(existingTemplate?.isPublished || false);
  const [isDefault, setIsDefault] = useState<boolean>(existingTemplate?.isDefault || false);

  // Theme Palette Tokens State
  const [theme, setTheme] = useState<ThemeTokens>(() =>
    existingTemplate?.layoutConfig?.theme
      ? { ...DEFAULT_THEME, ...existingTemplate.layoutConfig.theme }
      : DEFAULT_THEME
  );

  // Custom HTML + CSS Code State (with LocalStorage Draft Recovery)
  const [customHtml, setCustomHtml] = useState<string>(() => {
    if (existingTemplate?.layoutConfig?.customHtml) {
      return existingTemplate.layoutConfig.customHtml;
    }
    if (templateId) {
      const savedHtml = localStorage.getItem(`template_draft_html_${templateId}`);
      if (savedHtml) return savedHtml;
    }
    return DEFAULT_HTML_BOILERPLATE;
  });

  const [customCss, setCustomCss] = useState<string>(() => {
    if (existingTemplate?.layoutConfig?.customCss !== undefined) {
      return existingTemplate.layoutConfig.customCss;
    }
    if (templateId) {
      const savedCss = localStorage.getItem(`template_draft_css_${templateId}`);
      if (savedCss !== null) return savedCss;
    }
    return DEFAULT_CSS_BOILERPLATE;
  });

  // Track if a local draft exists that differs from server
  const [hasLocalDraft, setHasLocalDraft] = useState<boolean>(false);

  // Studio UI State
  const [activeTab, setActiveTab] = useState<'code' | 'palette' | 'metadata'>('code');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);
  const [copiedTag, setCopiedTag] = useState<string>('');

  // Close full screen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPreview) {
        setIsFullscreenPreview(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPreview]);

  // Synchronize state when existingTemplate arrives or updates
  useEffect(() => {
    if (existingTemplate) {
      if (existingTemplate.name) setName(existingTemplate.name);
      if (existingTemplate.slug) setSlug(existingTemplate.slug);
      if (existingTemplate.description !== undefined) setDescription(existingTemplate.description || '');
      if (existingTemplate.category) setCategory(existingTemplate.category);
      if (existingTemplate.isPublished !== undefined) setIsPublished(existingTemplate.isPublished);
      if (existingTemplate.isDefault !== undefined) setIsDefault(existingTemplate.isDefault);

      if (existingTemplate.layoutConfig) {
        const serverHtml = existingTemplate.layoutConfig.customHtml;
        const serverCss = existingTemplate.layoutConfig.customCss;

        if (serverHtml && serverHtml.trim()) {
          setCustomHtml(serverHtml);
          if (templateId) {
            localStorage.setItem(`template_draft_html_${templateId}`, serverHtml);
          }
        } else if (templateId) {
          // If server didn't have customHtml (e.g. backend stripped it), check local draft
          const localDraftHtml = localStorage.getItem(`template_draft_html_${templateId}`);
          if (localDraftHtml && localDraftHtml.trim()) {
            setCustomHtml(localDraftHtml);
            setHasLocalDraft(true);
          }
        }

        if (serverCss !== undefined && serverCss !== '') {
          setCustomCss(serverCss);
          if (templateId) {
            localStorage.setItem(`template_draft_css_${templateId}`, serverCss);
          }
        } else if (templateId) {
          const localDraftCss = localStorage.getItem(`template_draft_css_${templateId}`);
          if (localDraftCss !== null) {
            setCustomCss(localDraftCss);
          }
        }

        if (existingTemplate.layoutConfig.theme) {
          setTheme((prev) => ({ ...prev, ...existingTemplate.layoutConfig.theme }));
        }
      }
    }
  }, [existingTemplate, templateId]);

  // Auto-generate slug when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(''), 2000);
    showToast(`Copied "${tag}" to clipboard`);
  };

  // HTML file upload handler with style extraction
  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Extract embedded CSS from <style> tags if present
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        const styleMatches = [...content.matchAll(styleRegex)];
        if (styleMatches.length > 0) {
          const extractedCss = styleMatches.map((m) => m[1].trim()).join('\n\n');
          setCustomCss(extractedCss);
          const cleanHtml = content.replace(styleRegex, '').trim();
          setCustomHtml(cleanHtml);
          if (templateId) {
            localStorage.setItem(`template_draft_html_${templateId}`, cleanHtml);
            localStorage.setItem(`template_draft_css_${templateId}`, extractedCss);
          }
          setHasLocalDraft(true);
          showToast(`Loaded ${file.name} & extracted styling into CSS editor!`);
        } else {
          setCustomHtml(content);
          if (templateId) {
            localStorage.setItem(`template_draft_html_${templateId}`, content);
          }
          setHasLocalDraft(true);
          if (customCss === DEFAULT_CSS_BOILERPLATE) {
            setCustomCss('');
            if (templateId) {
              localStorage.setItem(`template_draft_css_${templateId}`, '');
            }
          }
          showToast(`Loaded ${file.name} successfully!`);
        }
      }
    };
    reader.readAsText(file);
  };

  // CSS file upload handler
  const handleCssFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCustomCss(content);
        if (templateId) {
          localStorage.setItem(`template_draft_css_${templateId}`, content);
        }
        setHasLocalDraft(true);
        showToast(`Loaded ${file.name} stylesheets successfully!`);
      }
    };
    reader.readAsText(file);
  };

  // Thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && templateId) {
      uploadThumbnailMutation.mutate(
        { id: templateId, file },
        {
          onSuccess: () => {
            showToast('Thumbnail screenshot uploaded successfully!');
          },
          onError: (err: AxiosError<{ message?: string }>) => {
            showToast(err.response?.data?.message || 'Failed to upload thumbnail.');
          },
        }
      );
    }
  };

  // Save handler
  const handleSave = (publishState?: boolean) => {
    if (!name.trim()) {
      showToast('Template name is required.');
      return;
    }
    if (!slug.trim()) {
      showToast('Template slug is required.');
      return;
    }

    const payloadLayoutConfig: LayoutConfig = {
      templateType: 'CUSTOM_HTML',
      customHtml: customHtml.trim(),
      customCss: (customCss || '').trim(),
      theme,
      sections: [],
    };

    const targetPublished = publishState !== undefined ? publishState : isPublished;

    // Persist draft in localStorage immediately
    if (templateId) {
      localStorage.setItem(`template_draft_html_${templateId}`, customHtml.trim());
      localStorage.setItem(`template_draft_css_${templateId}`, (customCss || '').trim());
    }

    if (isEditing && templateId) {
      updateMutation.mutate(
        {
          id: templateId,
          payload: {
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
            category,
            isPublished: targetPublished,
            isDefault,
            layoutConfig: payloadLayoutConfig,
          },
        },
        {
          onSuccess: () => {
            setIsPublished(targetPublished);
            if (templateId) {
              localStorage.setItem(`template_draft_html_${templateId}`, customHtml.trim());
              localStorage.setItem(`template_draft_css_${templateId}`, (customCss || '').trim());
            }
            showToast(`Template "${name}" saved successfully!`);
          },
          onError: (err: AxiosError<{ message?: string }>) => {
            showToast(err.response?.data?.message || err.message || 'Failed to update template.');
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          category,
          isPublished: targetPublished,
          isDefault,
          layoutConfig: payloadLayoutConfig,
        },
        {
          onSuccess: (created) => {
            if (created.id) {
              localStorage.setItem(`template_draft_html_${created.id}`, customHtml.trim());
              localStorage.setItem(`template_draft_css_${created.id}`, (customCss || '').trim());
            }
            showToast(`Template "${created.name}" created!`);
            navigate(`/admin/templates/builder/${created.id}`, { replace: true });
          },
          onError: (err: AxiosError<{ message?: string }>) => {
            showToast(err.response?.data?.message || err.message || 'Failed to create template.');
          },
        }
      );
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-screen w-full bg-[#181E35] text-[#FAF8F5] overflow-hidden font-sans">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. STUDIO TOP BAR
         ───────────────────────────────────────────────────────────────────────────── */}
      <header className="h-16 px-4 sm:px-6 bg-[#202744] border-b border-[#2A3454] flex items-center justify-between shrink-0 z-20 shadow-md">
        {/* Left: Return & Title */}
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/templates"
            className="p-2 rounded-xl bg-[#2A3454] hover:bg-[#344066] text-[#FAF8F5] transition"
            title="Back to Templates Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-xs">
                {name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#8B6CF6]/20 text-[#8B6CF6] text-[10px] font-mono font-bold uppercase border border-[#8B6CF6]/30">
                HTML + CSS
              </span>
              <span
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                  isPublished
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
              {hasLocalDraft && (
                <span
                  className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1"
                  title="Draft code is preserved locally in browser"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Draft Active</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#FAF8F5]/60 font-mono">
              slug: /{slug}
            </span>
          </div>
        </div>

        {/* Center: Responsive Device Switcher */}
        <div className="hidden md:flex items-center space-x-1 bg-[#181E35] p-1 rounded-xl border border-[#2A3454]">
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              previewDevice === 'desktop'
                ? 'bg-[#8B6CF6] text-white shadow-xs'
                : 'text-[#FAF8F5]/60 hover:text-white'
            }`}
            title="Desktop View (Full Width)"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden lg:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              previewDevice === 'tablet'
                ? 'bg-[#8B6CF6] text-white shadow-xs'
                : 'text-[#FAF8F5]/60 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden lg:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              previewDevice === 'mobile'
                ? 'bg-[#8B6CF6] text-white shadow-xs'
                : 'text-[#FAF8F5]/60 hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden lg:inline">Mobile</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Full Screen Preview Button */}
          <button
            type="button"
            onClick={() => setIsFullscreenPreview(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2A3454] hover:bg-[#344066] text-[#FAF8F5] text-xs font-bold border border-[#344066] transition active:scale-95 cursor-pointer shadow-xs"
            title="Full Screen Live Preview (Esc)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#8B6CF6]" />
            <span className="hidden lg:inline">Full Screen</span>
          </button>

          {isEditing && (
            <label className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2A3454] hover:bg-[#344066] text-[#FAF8F5] text-xs font-semibold cursor-pointer border border-[#344066] transition">
              <Upload className="w-3.5 h-3.5 text-[#8B6CF6]" />
              <span>Thumbnail</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploadThumbnailMutation.isPending}
                className="sr-only"
              />
            </label>
          )}

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2A3454] hover:bg-[#344066] text-white text-xs font-bold border border-[#344066] transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(!isPublished)}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-md cursor-pointer ${
              isPublished
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-[#8B6CF6] hover:bg-[#7A5CE6] text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 right-6 z-50 bg-[#8B6CF6] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#FFC45B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. TWO-PANEL STUDIO: EDITOR (LEFT) & LIVE SIMULATOR (RIGHT)
         ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── LEFT PANEL: Code, Palette & Metadata (450px) ─── */}
        <aside className="w-full md:w-[460px] lg:w-[500px] shrink-0 border-r border-[#2A3454] bg-[#202744]/95 flex flex-col overflow-hidden">
          {/* Main Navigation Tabs */}
          <div className="p-2 border-b border-[#2A3454] flex gap-1 bg-[#1A2038]">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-[#8B6CF6] text-white shadow-xs'
                  : 'text-[#FAF8F5]/60 hover:text-white hover:bg-[#2A3454]'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>HTML & CSS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('palette')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'palette'
                  ? 'bg-[#8B6CF6] text-white shadow-xs'
                  : 'text-[#FAF8F5]/60 hover:text-white hover:bg-[#2A3454]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Color Palette</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metadata')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'metadata'
                  ? 'bg-[#8B6CF6] text-white shadow-xs'
                  : 'text-[#FAF8F5]/60 hover:text-white hover:bg-[#2A3454]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Metadata</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* ════ TAB 1: CODE & FILE UPLOAD ════ */}
            {activeTab === 'code' && (
              <div className="space-y-4">
                {/* Upload Action Triggers */}
                <div className="p-3.5 rounded-2xl bg-[#181E35] border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#8B6CF6]" />
                      <span>Upload Template Files</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomHtml(DEFAULT_HTML_BOILERPLATE);
                        setCustomCss(DEFAULT_CSS_BOILERPLATE);
                        if (templateId) {
                          localStorage.removeItem(`template_draft_html_${templateId}`);
                          localStorage.removeItem(`template_draft_css_${templateId}`);
                        }
                        setHasLocalDraft(false);
                        showToast('Loaded starter HTML + CSS code');
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Starter Code</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 hover:border-[#8B6CF6] bg-slate-900/50 hover:bg-slate-900/80 transition cursor-pointer text-center group">
                      <FileCode className="w-5 h-5 text-[#8B6CF6] mb-1 group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-white">Upload .html</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Auto-extracts &lt;style&gt;</span>
                      <input
                        type="file"
                        accept=".html,.htm"
                        onChange={handleHtmlFileUpload}
                        className="hidden"
                      />
                    </label>

                    <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-700 hover:border-pink-400 bg-slate-900/50 hover:bg-slate-900/80 transition cursor-pointer text-center group">
                      <Code className="w-5 h-5 text-pink-400 mb-1 group-hover:scale-110 transition" />
                      <span className="text-xs font-bold text-white">Upload .css</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Optional stylesheet</span>
                      <input
                        type="file"
                        accept=".css"
                        onChange={handleCssFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* HTML Template Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                      <span>HTML Template</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">index.html</span>
                  </div>
                  <textarea
                    rows={12}
                    value={customHtml}
                    onChange={(e) => {
                      setCustomHtml(e.target.value);
                      if (templateId) {
                        localStorage.setItem(`template_draft_html_${templateId}`, e.target.value);
                      }
                      setHasLocalDraft(true);
                    }}
                    spellCheck={false}
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-hidden focus:border-[#8B6CF6] leading-relaxed resize-y shadow-inner"
                    placeholder="<!DOCTYPE html><html>...{{fullName}}...</html>"
                  />
                </div>

                {/* CSS Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-pink-400" />
                      <span>Custom CSS</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">style.css</span>
                  </div>
                  <textarea
                    rows={10}
                    value={customCss}
                    onChange={(e) => {
                      setCustomCss(e.target.value);
                      if (templateId) {
                        localStorage.setItem(`template_draft_css_${templateId}`, e.target.value);
                      }
                      setHasLocalDraft(true);
                    }}
                    spellCheck={false}
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 focus:outline-hidden focus:border-[#8B6CF6] leading-relaxed resize-y shadow-inner"
                    placeholder="/* Custom CSS using var(--primary), var(--bg), etc. */"
                  />
                </div>

                {/* Dynamic Tags & Variables Guide */}
                <div className="p-3.5 rounded-2xl bg-[#181E35] border border-slate-700/60 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                    Dynamic Tags & Placeholders (Click to Copy)
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Use these tags in your HTML and CSS. They are replaced with live user data and custom colors in real-time:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DYNAMIC_PLACEHOLDERS.map((item) => (
                      <button
                        key={item.tag}
                        type="button"
                        onClick={() => handleCopyTag(item.tag)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/80 hover:bg-[#8B6CF6]/20 border border-slate-700 hover:border-[#8B6CF6]/50 text-[10px] font-mono text-slate-200 transition cursor-pointer"
                        title={item.desc}
                      >
                        <span>{item.tag}</span>
                        {copiedTag === item.tag ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════ TAB 2: THEME PALETTE TOKENS ════ */}
            {activeTab === 'palette' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
                  Color palette configured here acts as the <strong>template&apos;s default styling</strong>. End-users can customize these exact tokens in their Theme Studio!
                </div>

                {/* 1-Click Color Presets */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2">
                    1-Click Palette Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setTheme((prev) => ({
                            ...prev,
                            primaryColor: preset.primary,
                            secondaryColor: preset.secondary,
                            backgroundColor: preset.bg,
                            surfaceColor: preset.surface,
                            textColor: preset.text,
                            textSecondaryColor: preset.textSecondary,
                            darkMode: preset.dark,
                          }));
                          showToast(`Applied "${preset.name}" palette!`);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-[#8B6CF6] flex items-center justify-between text-left transition cursor-pointer"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{preset.name}</span>
                          <span className="text-[10px] text-slate-400">{preset.dark ? 'Dark mode' : 'Light mode'}</span>
                        </div>
                        <div className="flex -space-x-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-800"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-slate-800"
                            style={{ backgroundColor: preset.bg }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary & Secondary Color Pickers */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Primary (--primary)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.primaryColor || '#8B6CF6'}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={theme.primaryColor || '#8B6CF6'}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Secondary (--secondary)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.secondaryColor || '#4697F5'}
                        onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={theme.secondaryColor || '#4697F5'}
                        onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Background & Surface Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Background (--bg)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.backgroundColor || '#0F172A'}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={theme.backgroundColor || '#0F172A'}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Surface / Card (--surface)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.surfaceColor || '#1E293B'}
                        onChange={(e) => setTheme({ ...theme, surfaceColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={theme.surfaceColor || '#1E293B'}
                        onChange={(e) => setTheme({ ...theme, surfaceColor: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Primary Text (--text)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.textColor || '#F8FAFC'}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={theme.textColor || '#F8FAFC'}
                        onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Secondary Text (--text-secondary)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.textSecondaryColor || '#94A3B8'}
                        onChange={(e) => setTheme({ ...theme, textSecondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={theme.textSecondaryColor || '#94A3B8'}
                        onChange={(e) => setTheme({ ...theme, textSecondaryColor: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Font & Radius */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Font Family
                    </label>
                    <select
                      value={theme.fontFamily}
                      onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="Inter">Inter (Modern Clean)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="Outfit">Outfit (Tech Bold)</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Fira Code">Fira Code (Developer)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Border Radius (--radius)
                    </label>
                    <select
                      value={theme.borderRadius || '12px'}
                      onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="4px">Compact (4px)</option>
                      <option value="8px">Standard (8px)</option>
                      <option value="12px">Rounded (12px)</option>
                      <option value="16px">Smooth (16px)</option>
                      <option value="24px">Pill / Soft (24px)</option>
                    </select>
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2">
                    {theme.darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                    <span className="text-xs font-semibold text-white">Dark Mode Baseline</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={theme.darkMode ?? true}
                    onChange={(e) => setTheme({ ...theme, darkMode: e.target.checked })}
                    className="w-4 h-4 accent-[#8B6CF6] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ════ TAB 3: TEMPLATE METADATA ════ */}
            {activeTab === 'metadata' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#8B6CF6]"
                    placeholder="e.g. Minimalist Neo Developer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-indigo-300 focus:outline-hidden focus:border-[#8B6CF6]"
                    placeholder="e.g. minimalist-neo-developer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#8B6CF6]"
                  >
                    <option value="DEVELOPER">Developer & Software Engineer</option>
                    <option value="BUSINESS">Business, Agency & Corporate</option>
                    <option value="CREATIVE">Creative, Designer & Artist</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#8B6CF6]"
                    placeholder="Short description highlighting this template's design aesthetic..."
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white block">Platform Default Template</span>
                    <span className="text-[10px] text-slate-400">Apply automatically to new user profiles</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 accent-[#8B6CF6] cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ─── RIGHT PANEL: LIVE DEVICE SIMULATOR PLAYGROUND ─── */}
        <main className="flex-1 min-h-0 bg-[#121625] flex flex-col items-center justify-start overflow-hidden relative p-3 sm:p-6">
          <div className="w-full flex items-center justify-between pb-2 text-[11px] text-[#FAF8F5]/50 font-mono border-b border-[#202744] mb-3">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Compiled Template Simulator</span>
            </span>
            <div className="flex items-center gap-3">
              <span>Viewport: {previewDevice.toUpperCase()}</span>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#202744] hover:bg-[#2A3454] text-white border border-[#2A3454] hover:border-[#8B6CF6]/50 text-xs font-semibold transition cursor-pointer active:scale-95 shadow-xs"
                title="Buka Live Preview Layar Penuh (Esc untuk keluar)"
              >
                <Maximize2 className="w-3 h-3 text-[#8B6CF6]" />
                <span>Full Screen</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Frame with Isolated Responsive Viewport */}
          <ResponsiveSimulatorFrame
            device={previewDevice}
            className="flex-1 min-h-0 overflow-hidden"
          >
            <DynamicPortfolioRenderer
              data={{
                layout: {
                  templateType: 'CUSTOM_HTML',
                  customHtml,
                  customCss,
                  theme,
                  sections: [],
                },
              }}
              isInteractivePreview
            />
          </ResponsiveSimulatorFrame>
        </main>
      </div>

      {/* ─── FULL SCREEN LIVE PREVIEW OVERLAY MODAL ─── */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-[#0B0E17] flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Fullscreen Header Bar */}
          <header className="h-16 px-4 sm:px-6 bg-[#181E35]/95 backdrop-blur-md border-b border-[#2A3454] flex items-center justify-between shrink-0 z-10 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <h3 className="font-bold text-sm text-white">{name}</h3>
                <p className="text-[10px] text-slate-400 font-mono">Live Fullscreen Studio Simulator</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#121625] p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-[#8B6CF6] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  previewDevice === 'tablet'
                    ? 'bg-[#8B6CF6] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-[#8B6CF6] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenPreview(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition cursor-pointer"
            >
              Exit Preview (Esc)
            </button>
          </header>

          <div className="flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-8 bg-[#0D101C]">
            <ResponsiveSimulatorFrame
              device={previewDevice}
              className="flex-1 h-full min-h-0"
              fullHeight
            >
              <DynamicPortfolioRenderer
                data={{
                  layout: {
                    templateType: 'CUSTOM_HTML',
                    customHtml,
                    customCss,
                    theme,
                    sections: [],
                  },
                }}
                isInteractivePreview
              />
            </ResponsiveSimulatorFrame>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminTemplateBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useAdminTemplate(id || '', {
    enabled: isEditing,
  });

  if (isEditing && isLoadingTemplate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-3" />
        <p className="font-sans text-sm font-semibold">Loading template blueprint...</p>
      </div>
    );
  }

  return (
    <TemplateStudioEditor
      key={existingTemplate?.id || 'new'}
      existingTemplate={existingTemplate}
      templateId={id}
    />
  );
};

export default AdminTemplateBuilder;
