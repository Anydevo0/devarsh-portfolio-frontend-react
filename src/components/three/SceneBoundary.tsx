import { Component, type ReactNode } from 'react'

interface SceneBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

/**
 * Keeps a WebGL failure inside the hero's decorative layer.
 *
 * Context creation can fail for reasons no feature check predicts — a driver
 * blocklist, an exhausted context pool after many tabs, a GPU process crash. None of
 * those should take down a portfolio, so the scene degrades to its poster and the
 * rest of the page is untouched.
 */
export class SceneBoundary extends Component<SceneBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
