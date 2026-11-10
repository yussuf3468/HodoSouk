/**
 * Server entry — used ONLY at build time by scripts/prerender.mjs to turn
 * every route into static HTML. Nothing here runs in production.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';

export { headHtml, metaFor, notFoundMeta, routePaths } from './content/seo';
export { site } from './content/site';

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
