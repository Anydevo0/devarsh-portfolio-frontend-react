import '@fontsource-variable/fraunces'
import '@fontsource-variable/work-sans'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/space-grotesk'
// Latin subset only - Kalam sets exactly one string (the hero greeting).
import '@fontsource/kalam/latin-400.css'
import './styles/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
