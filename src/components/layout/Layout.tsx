import { Outlet } from 'react-router'

import { Footer } from './Footer'
import { Header } from './Header'

import { ChatWidget } from '@/components/chat/ChatWidget'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-void text-mist">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <ChatWidget />
    </div>
  )
}
