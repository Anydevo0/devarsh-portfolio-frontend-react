import { Link, NavLink, Outlet } from 'react-router'

import { useAuth } from '@/admin/auth/AuthContext'

const ADMIN_NAV = [
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/contact', label: 'Contact' },
  { to: '/admin/chat', label: 'Chat' },
]

/**
 * The admin shell keeps its own light palette rather than adopting the public site's
 * dark one. It is a tool, not a showpiece: long editing sessions in forms and tables
 * are easier on a high-contrast light surface, and keeping the two palettes separate
 * means a change to the marketing site can never make the editor unreadable.
 *
 * `NavLink` marks the active section, which the previous plain links could not.
 */
export function AdminLayout() {
  const { logout } = useAuth()

  return (
    <div className="bg-paper text-ink min-h-screen">
      <header className="border-line/70 border-b">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
            <Link to="/admin" className="font-display text-lg font-bold tracking-tight">
              Admin
            </Link>
            <nav aria-label="Admin sections" className="flex flex-wrap gap-1">
              {ADMIN_NAV.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-sm transition-colors ${
                      isActive ? 'bg-ink/5 text-wire font-medium' : 'text-mute hover:text-wire'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-mute hover:text-wire font-mono text-sm">
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="border-line hover:bg-line/20 rounded-full border px-4 py-1.5 font-mono text-sm transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
