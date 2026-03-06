// SportSRC API v2 Configuration
// In dev: requests go to /api → proxied by Vite → https://api.sportsrc.org/v2/
// In production: point to a backend proxy or use a server-side approach
export const API_BASE_URL = '/api/';


// API Key loaded from .env (VITE_SPORTSRC_API_KEY)
export const getApiKey = () => import.meta.env.VITE_SPORTSRC_API_KEY || '';

// Match status values recognized by the API
export const MATCH_STATUS = {
    LIVE: 'inprogress',
    UPCOMING: 'upcoming',
    FINISHED: 'finished',
};

// Polling intervals (per API recommendation: 15-30s for live)
export const POLL_INTERVAL = {
    LIVE: 15_000,  // 15s – live matches
    LIST: 30_000,  // 30s – live match list
    INACTIVE: false,   // No polling for upcoming/finished
};

// Sport
export const SPORT = 'football';
