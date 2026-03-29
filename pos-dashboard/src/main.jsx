import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intercept fetch for Electron POS (redirect /api to local backend)
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    input = 'http://127.0.0.1:5000' + input;
  } else if (input instanceof URL && input.pathname.startsWith('/api/')) {
    input = new URL('http://127.0.0.1:5000' + input.pathname + input.search);
  } else if (input instanceof Request && input.url.includes('/api/')) {
    const url = new URL(input.url);
    if (url.pathname.startsWith('/api/')) {
      input = new Request('http://127.0.0.1:5000' + url.pathname + url.search, input);
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
