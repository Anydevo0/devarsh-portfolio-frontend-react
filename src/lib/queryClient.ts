import { QueryClient } from '@tanstack/react-query'

import { ApiError } from '@/lib/apiClient'

// A mild retry (1, not TanStack's default 3x exponential) — the backend's free-tier
// host scales to zero after idle, so a slow first response after a cold start is the
// realistic failure mode, not a fast/flaky one. But never retry a 4xx: a 404/422/etc.
// is a definite answer, not a transient failure, and retrying it only adds a pointless
// delay before the correct not-found/error state renders.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})
