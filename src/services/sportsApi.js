import axios from 'axios';
import { API_BASE_URL, getApiKey, SPORT } from '../config/api';

// Create axios instance
const api = axios.create({ baseURL: API_BASE_URL });

// Inject API key header on every request
api.interceptors.request.use((config) => {
    const key = getApiKey();
    if (key) config.headers['X-API-KEY'] = key;
    return config;
});

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
const get = (params) => api.get('', { params }).then((r) => r.data);

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────

/** Check plan, daily limit, usage stats */
export const fetchAccount = () => get({ type: 'account' });

/** List available sports */
export const fetchSports = () => get({ type: 'sports' });

// ─────────────────────────────────────────────
// Core Data (Free + Premium)
// ─────────────────────────────────────────────

/**
 * Get matches list
 * @param {'inprogress'|'upcoming'|'finished'} status
 * @param {string} date  YYYY-MM-DD
 */
export const fetchMatches = (status, date) =>
    get({ type: 'matches', sport: SPORT, status, date });

/**
 * Get full match detail including streaming URLs
 * NOTE: Stream embed iframes MUST NOT use the sandbox attribute
 */
export const fetchDetail = (id) => get({ type: 'detail', id });

// ─────────────────────────────────────────────
// Deep Data (Premium Only)
// ─────────────────────────────────────────────

/** Lightweight scores with has_stream + has_standing flags */
export const fetchScores = (id) => get({ type: 'scores', id });

/** Confirmed lineups, formations, player photos */
export const fetchLineups = (id) => get({ type: 'lineups', id });

/** Live match statistics: shots, xG, possession */
export const fetchStats = (id) => get({ type: 'stats', id });

/** Live timeline events: goals, cards, substitutions */
export const fetchIncidents = (id) => get({ type: 'incidents', id });

/** Head-to-head history & team form */
export const fetchH2H = (id) => get({ type: 'h2h', id });

/** Live league table (by match ID or league ID) */
export const fetchStanding = (id) => get({ type: 'standing', id });

/** Pressure / momentum graph data */
export const fetchGraph = (id) => get({ type: 'graph', id });

/** Pre-match and live betting odds (decimal & fractional) */
export const fetchOdds = (id) => get({ type: 'odds', id });

/** Community voting predictions */
export const fetchVotes = (id) => get({ type: 'votes', id });

/** Shot coordinates + xG, xGOT, block location */
export const fetchShotmap = (id) => get({ type: 'shotmap', id });

/** Last historical matches for both teams */
export const fetchLastMatches = (id) => get({ type: 'last_matches', id });
