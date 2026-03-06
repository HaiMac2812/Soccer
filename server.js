/**
 * server.js — Production server for Soccer Live app on Render.
 *
 * Responsibilities:
 *  1. Serve the Vite build output (dist/) as static files
 *  2. Proxy /api/* → https://api.sportsrc.org/v2/* (keeps API key server-side)
 *  3. Send React's index.html for any unmatched route (SPA fallback)
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── API key from Render environment variable ───────────────────────────────────
const API_KEY = process.env.SPORTSRC_API_KEY || '';
if (!API_KEY) {
    console.warn('[server] WARNING: SPORTSRC_API_KEY is not set. API calls will fail.');
}

// ── Proxy: /api/* → https://api.sportsrc.org/v2/* ────────────────────────────
app.use(
    '/api',
    createProxyMiddleware({
        target: 'https://api.sportsrc.org',
        changeOrigin: true,
        secure: true,
        pathRewrite: { '^/api': '/v2' },
        on: {
            proxyReq: (proxyReq) => {
                // Inject API key on the server side (not exposed to browser)
                proxyReq.setHeader('X-API-KEY', API_KEY);
                // Spoof referrer so stream sources accept embed requests
                proxyReq.setHeader('Referer', 'https://api.sportsrc.org/');
            },
        },
        logger: console,
    })
);

// ── Serve Vite build output ───────────────────────────────────────────────────
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

// ── SPA fallback: always return index.html for unmatched routes ───────────────
app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[Soccer Live] Running at http://localhost:${PORT}`);
});
