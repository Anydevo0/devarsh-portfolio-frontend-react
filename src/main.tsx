import '@fontsource-variable/fraunces'
import '@fontsource-variable/work-sans'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/space-grotesk'
// Latin subset only. 400 sets the hero greeting and the About page's handwritten
// body copy; 700 is the thicker hand for its heading and the sticky-note titles.
import '@fontsource/kalam/latin-400.css'
import '@fontsource/kalam/latin-700.css'
import './styles/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
