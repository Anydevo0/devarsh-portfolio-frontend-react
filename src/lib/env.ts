// Fail fast if a required env var is missing, rather than surfacing a confusing
// "undefined/api/v1/projects" network error deep inside a component later.
function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name} (check .env / .env.production)`)
  }
  return value
}

export const API_BASE_URL = required('VITE_API_BASE_URL')
