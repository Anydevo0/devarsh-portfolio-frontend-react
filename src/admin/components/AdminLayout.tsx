import { Link, Outlet } from 'react-router'

import { useAuth } from '@/admin/auth/AuthContext'

export function AdminLayout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="font-display text-lg font-bold">
            Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/admin/projects" className="text-mute hover:text-wire">
              Projects
            </Link>
            <Link to="/admin/blog" className="text-mute hover:text-wire">
              Blog
            </Link>
            <Link to="/admin/contact" className="text-mute hover:text-wire">
              Contact
            </Link>
            <Link to="/admin/chat" className="text-mute hover:text-wire">
              Chat
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={logout}
          className="font-mono text-sm text-mute hover:text-wire"
        >
          Log out
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
