import '@testing-library/jest-dom/vitest'

import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from '@/test/mocks/server'

// jsdom doesn't implement matchMedia — several components (prefers-reduced-motion,
// prefers-color-scheme) query it, so tests need a polyfill to avoid a hard crash.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom doesn't implement HTMLDialogElement.showModal/close (ConfirmDialog uses
// native <dialog>) — polyfilled by toggling the `open` attribute, matching the
// real browser behavior closely enough for tests.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  }
}

// jsdom doesn't implement Element.scrollIntoView (ChatWidget auto-scrolls the log
// on new messages) — a no-op polyfill is enough since tests don't assert on scroll
// position, only that calling it doesn't crash.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
