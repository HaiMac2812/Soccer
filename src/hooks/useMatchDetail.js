import { useQuery } from '@tanstack/react-query';
import { fetchDetail } from '../services/sportsApi';
import { POLL_INTERVAL, MATCH_STATUS } from '../config/api';

/**
 * Fetches full match detail including stream sources.
 * API v2 detail response: { success, data: { match_info: {...}, sources: [{embedUrl,...}] } }
 *
 * CRITICAL: Stream embedUrls must be placed in an <iframe> WITHOUT sandbox attribute.
 */
export function useMatchDetail(matchId, status) {
    const isLive = status === MATCH_STATUS.LIVE;

    return useQuery({
        queryKey: ['detail', matchId],
        queryFn: () => fetchDetail(matchId),
        enabled: !!matchId,
        refetchInterval: isLive ? POLL_INTERVAL.LIVE : false,
        placeholderData: (prev) => prev,
        select: (data) => {
            // API v2: { success, data: { match_info, sources } }
            // Normalise to a flat shape used by components
            const inner = data?.data ?? data;
            const matchInfo = inner?.match_info ?? inner?.match ?? inner ?? {};
            const sources = inner?.sources ?? inner?.streams ?? [];
            return { ...matchInfo, _sources: sources };
        },
        retry: 2,
        staleTime: 5_000,
    });
}
