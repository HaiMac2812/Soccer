/**
 * server.js — Production server for Soccer Live on Render.
 *
 * Uses Node 18+ native fetch (no extra proxy packages needed).
 * 1. Proxies /api/* → https://api.sportsrc.org/v2/* (adds API key server-side)
 * 2. Serves the Vite dist/ build as static files
 * 3. SPA fallback — returns index.html for unmatched routes
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// API key injected from Render env var (or fallback empty)
const API_KEY = process.env.SPORTSRC_API_KEY || '';

if (!API_KEY) {
    console.warn('[server] SPORTSRC_API_KEY not set — users must enter key via the in-app Settings UI.');
}

// ── Proxy: /api → https://api.sportsrc.org/v2 ───────────────────────────────
app.use('/api', async (req, res) => {
    try {
        // Rebuild query string (express strips it from req.path)
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        const url = `https://api.sportsrc.org/v2${req.path}${qs}`;

        const upstream = await fetch(url, {
            method: req.method,
            headers: {
                'X-API-KEY': API_KEY,
                'Referer': 'https://sportsrc.org/',
                'Origin': 'https://sportsrc.org',
                'Accept': 'application/json',
            },
        });

        const body = await upstream.text();
        const contentType = upstream.headers.get('content-type') || 'application/json';

        res.status(upstream.status).type(contentType).send(body);
    } catch (err) {
        console.error('[proxy error]', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
});

// ── Static files from Vite build ─────────────────────────────────────────────
const distPath = join(__dirname, 'dist');
app.use(express.static(distPath));

// ── SPA fallback ──────────────────────────────────────────────────────────────
// Express 5 no longer accepts bare '*' — use '/:path(*)' instead
app.get('/:path(*)', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[Soccer Live] Server running on port ${PORT}`);
});
