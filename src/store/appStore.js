import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MATCH_STATUS } from '../config/api';

const useAppStore = create(
    persist(
        (set) => ({
            // ── Filter state ──────────────────────────────
            status: MATCH_STATUS.LIVE,
            date: new Date().toISOString().slice(0, 10),
            searchQuery: '',

            // ── Selected match ────────────────────────────
            activeMatchId: null,

            // ── Actions ───────────────────────────────────
            setStatus: (status) => set({ status, activeMatchId: null }),
            setDate: (date) => set({ date }),
            setSearchQuery: (searchQuery) => set({ searchQuery }),
            setActiveMatchId: (activeMatchId) => set({ activeMatchId }),
        }),
        {
            name: 'soccer-live-store',
            // Only persist filter prefs (not activeMatchId)
            partialize: (state) => ({
                status: state.status,
                date: state.date,
            }),
        }
    )
);

export default useAppStore;
