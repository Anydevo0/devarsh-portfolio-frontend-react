import { useState } from 'react'
import { Link } from 'react-router'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { Pill } from '@/admin/components/Pill'
import { useAdminProjects } from '@/admin/hooks/useAdminProjects'
import { useDeleteProject } from '@/admin/hooks/useProjectMutations'

export function ProjectListPage() {
  const { data, isLoading, isError } = useAdminProjects()
  const deleteMutation = useDeleteProject()
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const pendingDeleteTitle = data?.items.find((p) => p.id === pendingDeleteId)?.title

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Projects</h1>
        <Link
          to="/admin/projects/new"
          className="rounded bg-ink px-4 py-2 font-mono text-sm text-paper hover:bg-ink/90"
        >
          New project
        </Link>
      </div>

      {isLoading && <p className="mt-6 font-mono text-sm text-mute">Loading…</p>}
      {isError && (
        <p role="alert" className="mt-6 font-mono text-sm text-signal">
          Couldn&apos;t load projects.
        </p>
      )}
      {data && data.items.length === 0 && (
        <p className="mt-6 font-mono text-sm text-mute">No projects yet.</p>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-mute uppercase">
                <th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Stack</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((project) => {
                const thumbnail = project.image_urls[0]
                return (
                  <tr key={project.id} className="border-b border-line">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {thumbnail && (
                          <img
                            src={thumbnail}
                            alt=""
                            className="size-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="font-mono text-xs text-mute">{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-mute">
                      {project.tech_stack.join(', ')}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <Pill tone={project.is_published ? 'wire' : 'outline'}>
                          {project.is_published ? 'Published' : 'Draft'}
                        </Pill>
                        {project.is_featured && <Pill tone="signal">Featured</Pill>}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{project.display_order}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-mute">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          className="font-mono text-xs text-wire hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(project.id)}
                          className="font-mono text-xs text-signal hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this project?"
        description={`"${pendingDeleteTitle ?? ''}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete project"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId !== null) {
            deleteMutation.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) })
          }
        }}
      />
    </div>
  )
}
