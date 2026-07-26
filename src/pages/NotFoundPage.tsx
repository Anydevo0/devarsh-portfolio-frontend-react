import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-mono text-sm text-mute">404</p>
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <Link to="/" className="text-wire underline">
        Back to home
      </Link>
    </main>
  )
}
