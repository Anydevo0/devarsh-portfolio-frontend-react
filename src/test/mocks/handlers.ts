import type { HttpHandler } from 'msw'

// Populated incrementally as each phase adds real endpoint mocks.
export const handlers: HttpHandler[] = []
