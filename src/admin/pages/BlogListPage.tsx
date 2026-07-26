import { useState } from 'react'
import { Link } from 'react-router'

import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { Pill } from '@/admin/components/Pill'
import { useAdminBlogPosts } from '@/admin/hooks/useAdminBlogPosts'
import { useDeleteBlogPost } from '@/admin/hooks/useBlogPostMutations'

export function BlogListPage() {
  const { data, isLoading, isError } = useAdminBlogPosts()
  const deleteMutation = useDeleteBlogPost()
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const pendingDeleteTitle = data?.items.find((p) => p.id === pendingDeleteId)?.title

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Blog</h1>
        <Link
          to="/admin/blog/new"
          className="rounded bg-ink px-4 py-2 font-mono text-sm text-paper hover:bg-ink/90"
        >
          New post
        </Link>
      </div>

      {isLoading && <p className="mt-6 font-mono text-sm text-mute">Loading…</p>}
      {isError && (
        <p role="alert" className="mt-6 font-mono text-sm text-signal">
          Couldn&apos;t load posts.
        </p>
      )}
      {data && data.items.length === 0 && (
        <p className="mt-6 font-mono text-sm text-mute">No posts yet.</p>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-mute uppercase">
                <th className="py-2 pr-4">Post</th>
                <th className="py-2 pr-4">Tags</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((post) => {
                const thumbnail = post.cover_image_url
                return (
                  <tr key={post.id} className="border-b border-line">
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
                          <p className="font-medium">{post.title}</p>
                          <p className="font-mono text-xs text-mute">{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-mute">
                      {post.tags.join(', ')}
                    </td>
                    <td className="py-3 pr-4">
                      <Pill tone={post.is_published ? 'wire' : 'outline'}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </Pill>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-mute">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/admin/blog/${post.id}/edit`}
                          className="font-mono text-xs text-wire hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(post.id)}
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
        title="Delete this post?"
        description={`"${pendingDeleteTitle ?? ''}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete post"
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
