import { adminFetch } from './client'

import type { Page, ProjectRead, ProjectWrite } from '@/types/api'

export function listProjects(): Promise<Page<ProjectRead>> {
  return adminFetch<Page<ProjectRead>>('/admin/projects?limit=100')
}

export function getProject(id: number): Promise<ProjectRead> {
  return adminFetch<ProjectRead>(`/admin/projects/${id}`)
}

export function createProject(payload: ProjectWrite): Promise<ProjectRead> {
  return adminFetch<ProjectRead>('/admin/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProject(id: number, payload: ProjectWrite): Promise<ProjectRead> {
  return adminFetch<ProjectRead>(`/admin/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteProject(id: number): Promise<void> {
  return adminFetch<void>(`/admin/projects/${id}`, { method: 'DELETE' })
}
