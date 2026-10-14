/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { LayoutConfig, SectionBlock } from '../../types/theme';
import type { Profile, Experience, Project, BusinessProfile, BusinessService, BusinessProject } from '../../types';
import {
  Mail, Phone, MapPin, Github, ExternalLink, Calendar,
  Briefcase, FolderGit2, Sparkles, Send, Star, ChevronDown
} from 'lucide-react';

export interface DynamicPortfolioData {
  profile?: Partial<Profile> | null;
  experiences?: Experience[];
  projects?: Project[];
  businessProfile?: Partial<BusinessProfile> | null;
  businessServices?: BusinessService[];
  businessProjects?: BusinessProject[];
  layout: LayoutConfig;
}

interface DynamicPortfolioRendererProps {
  data: DynamicPortfolioData;
  isInteractivePreview?: boolean;
  onProjectClick?: (projectId: string, title?: string) => void;
  onSocialClick?: (platform: string, label?: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. HERO_PROFILE Block
// ─────────────────────────────────────────────────────────────────────────────
const HeroBlock: React.FC<{
  section: SectionBlock;
  profile?: Partial<Profile> | null;
  onSocialClick?: (platform: string, label?: string) => void;
}> = ({ section, profile, onSocialClick }) => {
  const variant = section.variant || 'MODERN_SPLIT';
  const name = profile?.fullName || 'Alex Rivera';
  const headline = profile?.headline || 'Staff Systems & Frontend Architect';
  const bio = profile?.bio || 'Building scalable cloud-native web systems, distributed toolchains, and interactive design paradigms with React and TypeScript.';
  const avatar = profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  const location = profile?.location || 'San Francisco, CA';
  const email = profile?.contactEmail;

  if (variant === 'MINIMAL_CENTER') {
    return (
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="relative inline-block mb-6">
          <img
            src={avatar}
            alt={name}
            className="w-28 h-28 rounded-full object-cover shadow-xl ring-4 ring-[var(--primary)]/20 mx-auto"
          />
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--bg)]" title="Open to opportunities" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--text)] mb-3">
          {name}
        </h1>
        <p className="text-lg md:text-xl font-semibold text-[var(--primary)] mb-4">
          {headline}
        </p>
        <p className="text-base text-[var(--text)]/75 max-w-2xl mx-auto leading-relaxed mb-8">
          {bio}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={() => onSocialClick?.('email', 'Email Direct')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius)] bg-[var(--primary)] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>Get in Touch</span>
            </a>
          )}
          {location && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 text-xs font-semibold text-[var(--text)]/80">
              <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{location}</span>
            </span>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'CREATIVE_BADGE') {
    return (
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="p-8 md:p-12 rounded-[var(--radius)] bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border border-[var(--primary)]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <img
              src={avatar}
              alt={name}
              className="w-36 h-36 md:w-44 md:h-44 rounded-[var(--radius)] object-cover shadow-2xl ring-2 ring-[var(--primary)]/40 shrink-0"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Developer Profile</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight mb-2">
                {name}
              </h1>
              <p className="text-base md:text-lg font-medium text-[var(--primary)] mb-4">
                {headline}
              </p>
              <p className="text-sm md:text-base text-[var(--text)]/80 leading-relaxed mb-6">
                {bio}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href="#contact"
                  className="px-5 py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition shadow-sm"
                >
                  Contact Me
                </a>
                <a
                  href="#projects"
                  className="px-5 py-2.5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/15 text-[var(--text)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--text)]/5 transition"
                >
                  View Showcases
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // DEFAULT / MODERN_SPLIT
  return (
    <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Available for new projects</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text)] tracking-tight leading-[1.1]">
            Hi, I'm <span className="text-[var(--primary)]">{name}</span>
          </h1>

          <p className="text-lg md:text-xl font-medium text-[var(--text)]/80">
            {headline}
          </p>

          <p className="text-sm md:text-base text-[var(--text)]/70 leading-relaxed max-w-xl">
            {bio}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#projects"
              className="px-6 py-3 rounded-[var(--radius)] bg-[var(--primary)] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-md"
            >
              Explore Projects
            </a>
            <a
              href="#contact"
              className="px-6 py-3 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/15 text-[var(--text)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--text)]/5 transition"
            >
              Let's Connect
            </a>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-xs text-[var(--text)]/60 pt-2 font-mono">
              <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Based in {location}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-[var(--radius)] bg-gradient-to-r from-[var(--primary)] to-[var(--secondary,#818cf8)] opacity-30 blur-xl group-hover:opacity-50 transition duration-500" />
            <img
              src={avatar}
              alt={name}
              className="relative w-72 h-80 sm:w-80 sm:h-96 rounded-[var(--radius)] object-cover shadow-2xl border-2 border-[var(--surface)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ABOUT_ME Block
// ─────────────────────────────────────────────────────────────────────────────
const AboutBlock: React.FC<{
  section: SectionBlock;
  profile?: Partial<Profile> | null;
}> = ({ section, profile }) => {
  const variant = section.variant || 'CLASSIC_CARD';
  const title = section.title || 'About Me';
  const bio = profile?.bio || 'Passionate software craftsman dedicated to clean architectures, responsive design systems, and delightful digital experiences.';
  const headline = profile?.headline;

  if (variant === 'SIDE_BY_SIDE') {
    return (
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start p-8 md:p-12 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 shadow-sm">
          <div className="md:col-span-4 space-y-3">
            <span className="w-2.5 h-8 rounded-full bg-[var(--primary)] inline-block" />
            <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
              {title}
            </h2>
            {headline && (
              <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider">
                {headline}
              </p>
            )}
          </div>
          <div className="md:col-span-8">
            <p className="text-base text-[var(--text)]/80 leading-relaxed whitespace-pre-line">
              {bio}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="p-8 md:p-10 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight mb-4 flex items-center gap-3">
          <span className="w-2.5 h-8 rounded-full bg-[var(--primary)]" />
          <span>{title}</span>
        </h2>
        {headline && (
          <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-wider mb-4">
            {headline}
          </p>
        )}
        <p className="text-base text-[var(--text)]/80 leading-relaxed whitespace-pre-line">
          {bio}
        </p>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. SKILLS_LIST Block
// ─────────────────────────────────────────────────────────────────────────────
const SkillsBlock: React.FC<{
  section: SectionBlock;
  skills?: string[];
}> = ({ section, skills = [] }) => {
  const title = section.title || 'Technical Skills';
  const variant = section.variant || 'TAG_CLOUD';
  const fallbackSkills = [
    'React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind CSS',
    'PostgreSQL', 'Docker', 'GraphQL', 'AWS Cloud', 'REST APIs'
  ];
  const displaySkills = skills.length > 0 ? skills : fallbackSkills;

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-[var(--text)]/60 mt-1">Tools and frameworks I utilize</p>
      </div>

      {variant === 'PROGRESS_BARS' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {displaySkills.map((skill, idx) => (
            <div
              key={idx}
              className="p-4 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 shadow-2xs"
            >
              <div className="flex justify-between text-xs font-bold text-[var(--text)] mb-2">
                <span>{skill}</span>
                <span className="text-[var(--primary)] font-mono">Expert</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--text)]/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--primary)]"
                  style={{ width: `${80 + (idx % 4) * 5}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
          {displaySkills.map((skill, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 text-xs md:text-sm font-semibold text-[var(--text)] shadow-3xs hover:border-[var(--primary)] hover:text-[var(--primary)] transition transform hover:-translate-y-0.5"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROJECT_LIST Block
// ─────────────────────────────────────────────────────────────────────────────
const ProjectsBlock: React.FC<{
  section: SectionBlock;
  projects?: Project[];
  onProjectClick?: (projectId: string, title?: string) => void;
  onSocialClick?: (platform: string, label?: string) => void;
}> = ({ section, projects = [], onProjectClick, onSocialClick }) => {
  const title = section.title || 'Selected Projects';
  const variant = section.variant || 'BENTO_GRID_3COL';

  const sampleProjects: Partial<Project>[] = [
    {
      id: 'demo-1',
      title: 'DevScope Cloud Analytics',
      description: 'Distributed monitoring and tracing dashboard for serverless microservices with real-time alerting.',
      techStacks: ['React', 'TypeScript', 'Tailwind', 'Go'],
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
      projectUrl: 'https://example.com',
      githubUrl: 'https://github.com',
    },
    {
      id: 'demo-2',
      title: 'Synapse Flow AI Agent Hub',
      description: 'Autonomous multi-agent workflow orchestration engine designed for developer productivity.',
      techStacks: ['Next.js', 'Python', 'FastAPI', 'Redis'],
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600',
      projectUrl: 'https://example.com',
    },
    {
      id: 'demo-3',
      title: 'NeonPay Global Gateway',
      description: 'Ultra-low latency international payment processing interface with automated FX settlement.',
      techStacks: ['React', 'PostgreSQL', 'Stripe API'],
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const items = projects.length > 0 ? projects : (sampleProjects as Project[]);

  return (
    <section id="projects" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-[var(--text)]/60 mt-1">
            Proven products and technical experiments
          </p>
        </div>
      </div>

      <div
        className={
          variant === 'MINIMAL_LIST'
            ? 'space-y-4'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        }
      >
        {items.map((proj) => (
          <div
            key={proj.id}
            className="group rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 overflow-hidden shadow-2xs hover:shadow-xl hover:border-[var(--primary)]/40 transition duration-300 flex flex-col justify-between"
          >
            <div>
              {proj.thumbnail ? (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900/5">
                  <img
                    src={proj.thumbnail}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-[var(--text)]/5 flex items-center justify-center">
                  <FolderGit2 className="w-8 h-8 text-[var(--text)]/30" />
                </div>
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition mb-2">
                  {proj.title}
                </h3>
                <p className="text-xs text-[var(--text)]/70 line-clamp-2 leading-relaxed mb-4">
                  {proj.description || 'No project description provided.'}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {proj.techStacks?.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[var(--text)]/5 text-[10px] font-mono font-semibold text-[var(--text)]/75"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-[var(--text)]/5 text-xs font-semibold text-[var(--primary)]">
              {proj.projectUrl ? (
                <a
                  href={proj.projectUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onProjectClick?.(proj.id || '', proj.title)}
                  className="inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Live App</span>
                </a>
              ) : <span />}

              {proj.githubUrl && (
                <a
                  href={proj.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onSocialClick?.('github', `GitHub: ${proj.title}`)}
                  className="inline-flex items-center gap-1 hover:underline text-[var(--text)]/70 cursor-pointer"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. EXPERIENCE_TIMELINE Block
// ─────────────────────────────────────────────────────────────────────────────
const ExperienceBlock: React.FC<{
  section: SectionBlock;
  experiences?: Experience[];
}> = ({ section, experiences = [] }) => {
  const variant = section.variant || 'VERTICAL_LINE';
  const title = section.title || 'Work Experience';

  const sampleExp: Partial<Experience>[] = [
    {
      id: 'exp-1',
      company: 'Vercel / Next.js Ecosystem',
      position: 'Senior Infrastructure Engineer',
      startDate: '2023',
      endDate: 'Present',
      description: 'Spearheaded edge runtime deployment pipelines and reduced build latency by 42% across serverless regions.',
    },
    {
      id: 'exp-2',
      company: 'Stripe Payments',
      position: 'Full Stack Software Engineer',
      startDate: '2021',
      endDate: '2023',
      description: 'Architected real-time merchant onboarding workflows and integrated automated KYC checks.',
    },
  ];

  const items = experiences.length > 0 ? experiences : (sampleExp as Experience[]);

  if (variant === 'CARDS_GRID') {
    return (
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-[var(--text)]/60 mt-1">Career journey and contributions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((exp) => (
            <div
              key={exp.id}
              className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 shadow-2xs hover:border-[var(--primary)]/40 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-[var(--text)]">
                    {exp.position}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--primary)] font-bold">
                    <Calendar className="w-3 h-3" />
                    {exp.startDate} — {exp.endDate || 'Active'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text)]/70 mb-3">
                  {exp.company}
                </p>
                {exp.description && (
                  <p className="text-xs text-[var(--text)]/80 leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-[var(--text)]/60 mt-1">Career journey and contributions</p>
      </div>

      <div className="relative border-l-2 border-[var(--primary)]/30 pl-6 ml-4 space-y-8">
        {items.map((exp) => (
          <div key={exp.id} className="relative group">
            <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--surface)] border-2 border-[var(--primary)] group-hover:bg-[var(--primary)] transition" />
            <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h3 className="text-base font-bold text-[var(--text)]">
                  {exp.position}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--primary)] font-bold">
                  <Calendar className="w-3 h-3" />
                  {exp.startDate} — {exp.endDate || 'Active'}
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--text)]/70 mb-3">
                {exp.company}
              </p>
              {exp.description && (
                <p className="text-xs text-[var(--text)]/80 leading-relaxed whitespace-pre-line">
                  {exp.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. SERVICES_GRID Block
// ─────────────────────────────────────────────────────────────────────────────
const ServicesBlock: React.FC<{
  section: SectionBlock;
  services?: BusinessService[] | string[];
}> = ({ section, services = [] }) => {
  const variant = section.variant || 'CARDS_3COL';
  const title = section.title || 'Services & Solutions';
  const defaultServices = [
    { title: 'Full-Stack Web Engineering', desc: 'Design, development, and deployment of reactive web apps with modern toolchains.' },
    { title: 'Cloud Infrastructure & DevOps', desc: 'Continuous integration, Docker containerization, Kubernetes, and AWS setup.' },
    { title: 'Technical Architecture Audit', desc: 'Performance optimization, security audits, and code review consulting.' },
  ];
  const items = services && services.length > 0 ? services : defaultServices;

  if (variant === 'MINIMAL_LIST') {
    return (
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-[var(--text)]/60 mt-1">High impact offerings for teams and businesses</p>
        </div>
        <div className="space-y-4">
          {items.map((srv, idx) => {
            const srvTitle = typeof srv === 'string' ? srv : 'name' in srv ? srv.name : 'title' in srv ? srv.title : 'Service';
            const srvDesc = typeof srv === 'string' ? 'Custom consulting and delivery.' : 'description' in srv ? srv.description || 'Custom offering.' : 'desc' in srv ? srv.desc : 'Custom offering.';
            return (
              <div key={idx} className="p-5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 shadow-3xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">{srvTitle}</h3>
                    <p className="text-xs text-[var(--text)]/70 mt-0.5">{srvDesc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-[var(--text)]/60 mt-1">High impact offerings for teams and businesses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((srv, idx) => {
          const srvTitle =
            typeof srv === 'string'
              ? srv
              : 'name' in srv
              ? srv.name
              : 'title' in srv
              ? srv.title
              : 'Service';
          const srvDesc =
            typeof srv === 'string'
              ? 'Custom consulting and delivery adapted to your requirements.'
              : 'description' in srv
              ? srv.description || 'Custom service offering.'
              : 'desc' in srv
              ? srv.desc
              : 'Custom service offering.';

          return (
            <div
              key={idx}
              className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 shadow-2xs hover:border-[var(--primary)]/50 transition duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text)] mb-2">
                {srvTitle}
              </h3>
              <p className="text-xs text-[var(--text)]/70 leading-relaxed">
                {srvDesc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. CONTACT_SECTION Block
// ─────────────────────────────────────────────────────────────────────────────
const ContactBlock: React.FC<{
  section: SectionBlock;
  profile?: Partial<Profile> | null;
  onSocialClick?: (platform: string, label?: string) => void;
}> = ({ section, profile, onSocialClick }) => {
  const variant = section.variant || 'FORM_AND_DETAILS';
  const title = section.title || "Let's Work Together";
  const email = profile?.contactEmail || 'hello@developer.io';
  const phone = profile?.phoneNumber;
  const location = profile?.location;

  if (variant === 'SIMPLE_LINKS') {
    return (
      <section id="contact" className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-xs md:text-sm text-[var(--text)]/70 max-w-md mx-auto mb-6">
          Reach out directly via email or phone.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {email && (
            <a
              href={`mailto:${email}`}
              onClick={() => onSocialClick?.('email', 'Email Direct')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{email}</span>
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              onClick={() => onSocialClick?.('phone', 'Phone Direct')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/15 text-[var(--text)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--text)]/5 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{phone}</span>
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 px-6 max-w-4xl mx-auto">
      <div className="p-8 md:p-12 rounded-[var(--radius)] bg-gradient-to-b from-[var(--surface)] to-[var(--bg)] border border-[var(--text)]/10 shadow-xl text-center">
        <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-sm text-[var(--text)]/70 max-w-lg mx-auto mb-8">
          Interested in starting a collaboration or discussing a technical project? Reach out directly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius)] bg-[var(--primary)] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Send Email</span>
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/15 text-[var(--text)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--text)]/5 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Call Direct</span>
            </a>
          )}
        </div>

        {location && (
          <p className="text-xs text-[var(--text)]/50 mt-6 font-mono">
            Location: {location}
          </p>
        )}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. CUSTOM_BANNER Block
// ─────────────────────────────────────────────────────────────────────────────
const BannerBlock: React.FC<{
  section: SectionBlock;
}> = ({ section }) => {
  const variant = section.variant || 'GRADIENT_ACCENT';
  const title = section.title || 'Open for Consulting & Contracting';

  if (variant === 'SUBTLE_CARD') {
    return (
      <section className="py-10 px-6 max-w-5xl mx-auto">
        <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border-2 border-[var(--primary)]/30 text-[var(--text)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
            <p className="text-xs text-[var(--text)]/70 mt-0.5">Specialized in React, TypeScript, Cloud Architectures.</p>
          </div>
          <a
            href="#contact"
            className="px-5 py-2.5 rounded-[var(--radius)] bg-[var(--primary)] text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shrink-0"
          >
            Contact Now
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-6 max-w-5xl mx-auto">
      <div className="p-6 rounded-[var(--radius)] bg-[var(--primary)] text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-xs text-white/80 mt-0.5">Specialized in React, TypeScript, Cloud Architectures.</p>
        </div>
        <a
          href="#contact"
          className="px-5 py-2.5 rounded-[var(--radius)] bg-white text-slate-900 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition shrink-0"
        >
          Contact Now
        </a>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. CLIENTS_LOGO Block
// ─────────────────────────────────────────────────────────────────────────────
export const ClientsLogoBlock: React.FC<{
  title?: string;
  logos?: any[];
  theme?: any;
}> = ({ title, logos = [] }) => {
  if (!logos || logos.length === 0) return null;
  return (
    <div className="py-12 border-y border-[var(--text)]/10 bg-[var(--surface)]/40">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {title && <p className="text-xs uppercase font-bold tracking-widest text-[var(--text)]/60 mb-8">{title}</p>}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-85 hover:opacity-100 transition-opacity">
          {logos.map((logo: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-[var(--text)] font-bold text-base tracking-tight">
              {logo.logoUrl ? (
                <img src={logo.logoUrl} alt={logo.name || 'Client logo'} className="h-7 w-auto object-contain filter grayscale hover:grayscale-0 transition-all" />
              ) : (
                <span className="px-4 py-2 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 text-[var(--text)]/80 hover:text-[var(--text)] transition-colors">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. COMPANY_STATS Block
// ─────────────────────────────────────────────────────────────────────────────
export const CompanyStatsBlock: React.FC<{
  title?: string;
  stats?: any[];
  theme?: any;
}> = ({ title, stats = [] }) => {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="py-16 bg-[var(--surface)]/30">
      <div className="max-w-6xl mx-auto px-6">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight">{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((item: any, idx: number) => (
            <div key={idx} className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 backdrop-blur-sm shadow-xs">
              <h3 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary,#06b6d4)]">
                {item.value}
              </h3>
              <p className="mt-2 text-xs md:text-sm font-semibold text-[var(--text)]/80">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. PROCESS_WORKFLOW Block
// ─────────────────────────────────────────────────────────────────────────────
export const ProcessWorkflowBlock: React.FC<{
  title?: string;
  steps?: any[];
  theme?: any;
}> = ({ title = 'Our Working Process', steps = [] }) => {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="py-20 max-w-6xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">{title}</h2>
        <p className="text-sm text-[var(--text)]/60 mt-2">Bagaimana kami mengantarkan proyek Anda dari konsep hingga peluncuran.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step: any, idx: number) => (
          <div key={idx} className="relative p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 hover:border-[var(--primary)]/50 transition-all shadow-xs">
            <span className="text-4xl font-extrabold text-[var(--primary)]/30 font-mono">{step.step || `0${idx + 1}`}</span>
            <h4 className="text-base font-bold text-[var(--text)] mt-4">{step.title}</h4>
            <p className="text-xs text-[var(--text)]/70 mt-2 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. TESTIMONIALS Block
// ─────────────────────────────────────────────────────────────────────────────
export const TestimonialsBlock: React.FC<{
  title?: string;
  testimonials?: any[];
  theme?: any;
}> = ({ title = 'Client Testimonials', testimonials = [] }) => {
  if (!testimonials || testimonials.length === 0) return null;
  return (
    <div className="py-20 bg-[var(--surface)]/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item: any, idx: number) => (
            <div key={idx} className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-[var(--text)]/80 italic leading-relaxed">
                  "{item.content}"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3">
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt={item.clientName} className="w-10 h-10 rounded-full object-cover border border-[var(--text)]/20" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-bold flex items-center justify-center text-sm border border-[var(--primary)]/30">
                    {item.clientName?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)]">{item.clientName}</h4>
                  <p className="text-[11px] text-[var(--text)]/60">{item.clientRole} {item.clientCompany && `• ${item.clientCompany}`}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 13. FAQ_ACCORDION Block
// ─────────────────────────────────────────────────────────────────────────────
export const FaqAccordionBlock: React.FC<{
  title?: string;
  faqs?: any[];
  theme?: any;
}> = ({ title = 'Frequently Asked Questions', faqs = [] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="py-20 max-w-4xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]">{title}</h2>
      </div>
      <div className="space-y-3">
        {faqs.map((faq: any, idx: number) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--text)]/10 overflow-hidden transition-colors shadow-2xs">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-semibold text-sm text-[var(--text)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-[var(--text)]/50 transition-transform ${isOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-[var(--text)]/75 leading-relaxed border-t border-[var(--text)]/10 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 14. CTA_BANNER Block
// ─────────────────────────────────────────────────────────────────────────────
export const CtaBannerBlock: React.FC<{
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  theme?: any;
}> = ({ title = 'Ready to Build?', description, primaryButtonText = 'Schedule Consultation', primaryButtonUrl = '#contact' }) => {
  return (
    <div className="py-16 max-w-6xl mx-auto px-6">
      <div className="rounded-[var(--radius)] p-8 md:p-14 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary,#4f46e5)] text-center text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
          {description && <p className="mt-4 text-sm md:text-base text-white/90 leading-relaxed">{description}</p>}
          <div className="mt-8">
            <a
              href={primaryButtonUrl || '#contact'}
              className="inline-block px-8 py-3.5 rounded-[var(--radius)] bg-white text-slate-900 font-bold text-sm shadow-xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
            >
              {primaryButtonText || 'Schedule Consultation'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Dynamic Portfolio Renderer
// ─────────────────────────────────────────────────────────────────────────────
export const DynamicPortfolioRenderer: React.FC<DynamicPortfolioRendererProps> = ({
  data,
  onProjectClick,
  onSocialClick,
}) => {
  const {
    layout,
    profile,
    experiences,
    projects,
    businessProfile,
    businessServices,
    businessProjects,
  } = data;

  const theme = layout.theme || {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    borderRadius: '12px',
  };

  // Harmonize personal profile and business profile data
  const effectiveProfile: Partial<Profile> | null | undefined =
    profile ||
    (businessProfile
      ? {
          fullName: businessProfile.businessName,
          headline: businessProfile.location || 'Corporate Showcase',
          bio: businessProfile.description,
          profileImage: businessProfile.logo || businessProfile.bannerImage,
          location: businessProfile.location,
          contactEmail: businessProfile.contactEmail,
          phoneNumber: businessProfile.phoneNumber,
        }
      : null);

  const effectiveProjects: Project[] =
    projects && projects.length > 0
      ? projects
      : businessProjects && businessProjects.length > 0
      ? businessProjects.map((bp) => ({
          id: bp.id,
          userId: bp.userId || '',
          title: bp.title,
          description: bp.description,
          thumbnail: bp.thumbnail,
          images: bp.images,
          techStacks: bp.projectType ? [bp.projectType] : [],
          projectUrl: '',
          type: 'WORK',
          isPublic: bp.isPublic ?? true,
          createdAt: bp.createdAt || '',
          updatedAt: bp.updatedAt || '',
        }))
      : [];

  const effectiveServices =
    profile?.services && profile.services.length > 0
      ? profile.services
      : businessServices && businessServices.length > 0
      ? businessServices
      : [];

  const sections = layout.sections || [];
  const visibleSections = sections.filter((s) => s.isVisible);

  return (
    <div
      style={
        {
          '--primary': theme.primaryColor || '#000000',
          '--secondary': theme.secondaryColor || '#6366f1',
          '--bg': theme.backgroundColor || '#ffffff',
          '--surface': theme.surfaceColor || '#ffffff',
          '--text': theme.textColor || '#0f172a',
          '--radius': theme.borderRadius || '12px',
          fontFamily: theme.fontFamily || 'Inter, sans-serif',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
        } as React.CSSProperties
      }
      className={`min-h-screen transition-colors duration-200 ${
        theme.darkMode ? 'dark' : ''
      }`}
    >
      {visibleSections.length === 0 ? (
        <div className="py-24 text-center text-slate-400">
          <p className="text-sm">No sections visible in this portfolio layout.</p>
        </div>
      ) : (
        visibleSections.map((section) => {
          switch (section.type) {
            case 'HERO_PROFILE':
              return (
                <HeroBlock
                  key={section.id}
                  section={section}
                  profile={effectiveProfile}
                  onSocialClick={onSocialClick}
                />
              );

            case 'ABOUT_ME':
              return (
                <AboutBlock
                  key={section.id}
                  section={section}
                  profile={effectiveProfile}
                />
              );

            case 'SKILLS_LIST':
              return (
                <SkillsBlock
                  key={section.id}
                  section={section}
                  skills={effectiveProfile?.skills}
                />
              );

            case 'PROJECT_LIST':
              return (
                <ProjectsBlock
                  key={section.id}
                  section={section}
                  projects={effectiveProjects}
                  onProjectClick={onProjectClick}
                  onSocialClick={onSocialClick}
                />
              );

            case 'EXPERIENCE_TIMELINE':
              return (
                <ExperienceBlock
                  key={section.id}
                  section={section}
                  experiences={experiences}
                />
              );

            case 'SERVICES_GRID':
              return (
                <ServicesBlock
                  key={section.id}
                  section={section}
                  services={effectiveServices}
                />
              );

            case 'CONTACT_SECTION':
              return (
                <ContactBlock
                  key={section.id}
                  section={section}
                  profile={effectiveProfile}
                  onSocialClick={onSocialClick}
                />
              );

            case 'CUSTOM_BANNER':
              return (
                <BannerBlock
                  key={section.id}
                  section={section}
                />
              );

            case 'CLIENTS_LOGO':
              return (
                <ClientsLogoBlock
                  key={section.id}
                  title={section.title || (section.props?.title as string) || 'Trusted by Innovative Companies'}
                  logos={(section.props?.logos as any[]) || []}
                  theme={theme}
                />
              );

            case 'COMPANY_STATS':
              return (
                <CompanyStatsBlock
                  key={section.id}
                  title={section.title || (section.props?.title as string) || 'Track Record'}
                  stats={(section.props?.stats as any[]) || []}
                  theme={theme}
                />
              );

            case 'PROCESS_WORKFLOW':
              return (
                <ProcessWorkflowBlock
                  key={section.id}
                  title={section.title || (section.props?.title as string) || 'Our Working Process'}
                  steps={(section.props?.steps as any[]) || []}
                  theme={theme}
                />
              );

            case 'TESTIMONIALS':
              return (
                <TestimonialsBlock
                  key={section.id}
                  title={section.title || (section.props?.title as string) || 'Client Testimonials'}
                  testimonials={(section.props?.testimonials as any[]) || []}
                  theme={theme}
                />
              );

            case 'FAQ_ACCORDION':
              return (
                <FaqAccordionBlock
                  key={section.id}
                  title={section.title || (section.props?.title as string) || 'Frequently Asked Questions'}
                  faqs={(section.props?.faqs as any[]) || []}
                  theme={theme}
                />
              );

            case 'CTA_BANNER':
              return (
                <CtaBannerBlock
                  key={section.id}
                  title={(section.props?.title as string) || section.title || 'Ready to Build?'}
                  description={section.props?.description as string}
                  primaryButtonText={(section.props?.primaryButtonText as string) || 'Get In Touch'}
                  primaryButtonUrl={(section.props?.primaryButtonUrl as string) || '#contact'}
                  theme={theme}
                />
              );

            default:
              return null;
          }
        })
      )}

      {/* Footer Branding */}
      <footer className="py-8 border-t border-[var(--text)]/10 text-center text-xs opacity-60">
        <p>Powered by Foliowalaweh Portfolio Engine</p>
      </footer>
    </div>
  );
};

export default DynamicPortfolioRenderer;
