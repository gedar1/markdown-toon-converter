import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary/index.tsx'
import { ServicesProvider } from './context/ServicesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ServicesProvider>
        <App />
      </ServicesProvider>
    </ErrorBoundary>
  </StrictMode>,
)
