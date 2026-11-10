import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import './styles/index.css';

// The app shell decides scroll positions (only the main panel scrolls).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Prerendered pages hydrate; the dev server (empty #root) renders fresh.
// React's default recoverable-error reporting is kept on purpose: a hydration
// mismatch shows up in the console instead of being silently patched over.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
