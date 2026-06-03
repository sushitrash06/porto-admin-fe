/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Using 'as const' object + type union instead of 'enum'
// because erasableSyntaxOnly is enabled in tsconfig.
export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ProjectType = {
  PERSONAL: 'PERSONAL',
  WORK: 'WORK'
} as const

export type ProjectType =
  (typeof ProjectType)[keyof typeof ProjectType]

export interface Profile {
  fullName: string;
  profileImage?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  services?: string[];
  contactEmail?: string;
  phoneNumber?: string;
  location?: string;
  isPublic?: boolean;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  profile?: Profile | null;
  createdAt: string;
  updatedAt?: string;
}

/** Pagination meta from backend paginated endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Generic paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Experience {
  id: string;
  userId: string;
  company: string;
  position: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string or null/empty for "Present"
  companyLogo?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  experienceId?: string; // Reference to optional experience
  type: ProjectType;
  title: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  techStacks: string[];
  projectUrl?: string;
  githubUrl?: string;
  role?: string; // User role in the project
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
