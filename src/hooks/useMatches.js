import { useQuery } from '@tanstack/react-query';
import { fetchMatches } from '../services/sportsApi';
import { POLL_INTERVAL, MATCH_STATUS } from '../config/api';

/**
 * Fetches the match list and auto-polls for live matches.
 * API v2 response: { success, data: [ { league: {...}, matches: [...] } ] }
 * Flattens into a single array, injecting league info into each match.
 */
export function useMatches(status, date) {
    const isLive = status === MATCH_STATUS.LIVE;

    return useQuery({
        queryKey: ['matches', status, date],
        queryFn: () => fetchMatches(status, date),
        refetchInterval: isLive ? POLL_INTERVAL.LIST : false,
        placeholderData: (prev) => prev,
        select: (data) => {
            // API v2 response: { success: true, data: [ {league, matches: []} ] }
            const groups = data?.data ?? data ?? [];
            if (!Array.isArray(groups)) return [];

            // Flatten: inject league info into each match object
            return groups.flatMap((group) => {
                const league = group.league ?? {};
                const matches = Array.isArray(group.matches) ? group.matches : [];
                return matches.map((m) => ({
                    ...m,
                    _league_name: league.name ?? league.title ?? '',
                    _league_logo: league.logo ?? league.image ?? '',
                    _league_id: league.id ?? '',
                }));
            });
        },
        retry: 2,
        staleTime: isLive ? 10_000 : 60_000,
    });
}
