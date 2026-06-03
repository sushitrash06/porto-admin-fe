/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { User, Experience, Project } from '../types';
import { Role, ProjectType } from '../types';

const USERS_KEY = 'sandbox_users';
const EXPERIENCES_KEY = 'sandbox_experiences';
const PROJECTS_KEY = 'sandbox_projects';

export function initializeDB() {
    if (!localStorage.getItem(USERS_KEY)) {
        const initialUsers: User[] = [
            {
                id: 'd1d7a278-3357-44eb-ad5c-e18437a55188',
                email: 'user2@test.com',
                role: Role.USER,
                profile: {
                    fullName: 'Azka Andya',
                    profileImage: 'https://res.cloudinary.com/dyyamtplz/image/upload/v1779682325/profiles/udqeb6shcke5cfclw8pp.png',
                    bio: 'Senior Software Engineer specializing in React and Node.js.',
                    location: 'Jakarta, ID'
                },
                createdAt: new Date().toISOString()
            },
            {
                id: '24ea704a-bd41-4c82-bae5-bf74c0a2dfc3',
                email: 'user1@test.com',
                role: Role.USER,
                createdAt: new Date().toISOString()
            },
            {
                id: 'dacc5bdd-e446-42b0-b113-208af9261859',
                email: 'admin@porto.dev',
                role: Role.SUPER_ADMIN,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    }

    if (!localStorage.getItem(EXPERIENCES_KEY)) {
        const initialExperiences: Experience[] = [
            {
                id: 'exp-1',
                userId: 'd1d7a278-3357-44eb-ad5c-e18437a55188',
                company: 'Google DeepMind',
                position: 'Senior AI Engineer',
                description: 'Working on agentic workflows and LLM reasoning models.',
                startDate: '2024-01-01',
                isPublic: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(initialExperiences));
    }

    if (!localStorage.getItem(PROJECTS_KEY)) {
        const initialProjects: Project[] = [
            {
                id: 'proj-1',
                userId: 'd1d7a278-3357-44eb-ad5c-e18437a55188',
                experienceId: 'exp-1',
                type: ProjectType.WORK,
                title: 'Antigravity AI Platform',
                description: 'A developer tool for automated code repair and pair programming.',
                techStacks: ['React', 'TypeScript', 'Node.js', 'Python'],
                isPublic: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
    }
}

// Users API
export function getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = getUsers();
    const newUser: User = {
        ...user,
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users[idx];
}

export function deleteUser(id: string): void {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
}

// Experiences API
export function getExperiences(): Experience[] {
    const data = localStorage.getItem(EXPERIENCES_KEY);
    return data ? JSON.parse(data) : [];
}

export function createExperience(exp: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Experience {
    const exps = getExperiences();
    const newExp: Experience = {
        ...exp,
        id: 'exp-' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    exps.push(newExp);
    localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(exps));
    return newExp;
}

export function updateExperience(id: string, updates: Partial<Experience>): Experience {
    const exps = getExperiences();
    const idx = exps.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Experience not found');
    exps[idx] = { ...exps[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(exps));
    return exps[idx];
}

export function deleteExperience(id: string): void {
    const exps = getExperiences();
    const filtered = exps.filter(e => e.id !== id);
    localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(filtered));
}

// Projects API
export function getProjects(): Project[] {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
}

export function createProject(proj: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projs = getProjects();
    const newProj: Project = {
        ...proj,
        id: 'proj-' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    projs.push(newProj);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projs));
    return newProj;
}

export function updateProject(id: string, updates: Partial<Project>): Project {
    const projs = getProjects();
    const idx = projs.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    projs[idx] = { ...projs[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projs));
    return projs[idx];
}

export function deleteProject(id: string): void {
    const projs = getProjects();
    const filtered = projs.filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
}
