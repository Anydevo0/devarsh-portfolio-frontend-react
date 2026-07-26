import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createProject, deleteProject, updateProject } from '@/admin/api/projects'
import type { ProjectWrite } from '@/types/api'

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProjectWrite) => createProject(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProjectWrite }) =>
      updateProject(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects', variables.id] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] }),
  })
}
