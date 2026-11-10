import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';

// On Vercel, fall back to the project's production domain when VITE_SITE_URL
// is not set, so canonical URLs, Open Graph images and the sitemap are
// absolute from the very first deploy. An explicit VITE_SITE_URL always wins.
if (!process.env.VITE_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  process.env.VITE_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
}

/**
 * Runs `api/enquiry.ts` inside `npm run dev`, so the enquiry forms can be
 * exercised end-to-end locally exactly as they will run on Vercel.
 *
 * The function uses the Web-standard `POST(request): Response` signature, so
 * this adapter only has to translate Node's req/res into a Request and back.
 * Server-only variables (RESEND_API_KEY etc.) are read from `.env.local` and
 * placed on process.env here — they are never exposed to the browser bundle,
 * because Vite only exposes variables prefixed with VITE_.
 */
function devApi(mode: string): Plugin {
  return {
    name: 'hodo-dev-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const env = loadEnv(mode, process.cwd(), '');
      for (const [key, value] of Object.entries(env)) {
        if (!key.startsWith('VITE_') && process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use('/api/enquiry', async (req, res) => {
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(Buffer.from(chunk as Uint8Array));
          const body = Buffer.concat(chunks);

          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') headers.set(key, value);
          }

          const request = new Request(`http://localhost${req.originalUrl ?? '/api/enquiry'}`, {
            method: req.method ?? 'GET',
            headers,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
          });

          const mod = (await server.ssrLoadModule('/api/enquiry.ts')) as {
            POST: (r: Request) => Promise<Response>;
          };
          const response =
            req.method === 'POST'
              ? await mod.POST(request)
              : new Response(JSON.stringify({ ok: false, error: 'method_not_allowed' }), {
                  status: 405,
                  headers: { 'content-type': 'application/json', allow: 'POST' },
                });

          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(`[api/enquiry] ${String(error)}`);
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'server_error' }));
        }
      });
    },
  };
}

/**
 * Makes `vite preview` behave like the production host: each page is served
 * from its prerendered file, and an unknown URL gets 404.html with a real 404
 * status — instead of the SPA default of quietly serving the homepage.
 */
function previewLikeProduction(): Plugin {
  return {
    name: 'hodo-preview-404',
    configurePreviewServer(server) {
      const dist = path.resolve(server.config.root, server.config.build.outDir);
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '/').split('?')[0]!;
        const wantsHtml = req.headers.accept?.includes('text/html');
        if (!wantsHtml || url === '/' || path.extname(url) || url.startsWith('/api/')) return next();
        const page = path.join(dist, `${url.replace(/\/+$/, '')}.html`);
        if (fs.existsSync(page)) return next();
        res.statusCode = 404;
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(fs.readFileSync(path.join(dist, '404.html')));
      });
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), devApi(mode), previewLikeProduction()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    // The SSR bundle is only used at build time to prerender HTML; chunking
    // strategy applies to the browser bundle alone.
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            manualChunks: {
              react: ['react', 'react-dom', 'react-dom/client', 'react-router'],
              motion: ['framer-motion'],
            },
          },
        },
  },
  ssr: {
    // Bundle framer-motion into the prerender build so its ESM/CJS split
    // never matters to Node at prerender time.
    noExternal: ['framer-motion'],
  },
}));
