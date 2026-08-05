import { LazyMotion, domAnimation } from 'motion/react'
import { Outlet } from 'react-router'

import { Footer } from './Footer'
import { Header } from './Header'
import { Horizon } from './Horizon'

import { ChatWidget } from '@/components/chat/ChatWidget'
import { useHashScroll } from '@/hooks/useHashScroll'

/**
 * The public shell.
 *
 * `site-shell` scopes the dark palette's focus ring, selection colour and scrollbar
 * tint to these routes only — the admin panel sits outside this tree and keeps its
 * own light treatment. `grain` lays a fixed film of noise over everything, which is
 * what stops the page's large flat gradients from banding on 8-bit displays.
 *
 * `LazyMotion` loads the animation feature set once for the whole tree, which is why
 * every animated component here uses `m.*` instead of `motion.*`. Importing
 * `motion.div` anywhere would pull the full feature bundle into the main chunk and
 * undo the saving; `strict` turns that mistake into an error rather than a silent
 * regression noticed only in a bundle report.
 */
export function Layout() {
  useHashScroll()

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="site-shell grain bg-void text-mist flex min-h-screen flex-col antialiased">
        <Header />
        <div className="relative z-0 flex-1">
          <Outlet />
        </div>
        <Horizon />
        <Footer />
        <ChatWidget />
      </div>
    </LazyMotion>
  )
}
