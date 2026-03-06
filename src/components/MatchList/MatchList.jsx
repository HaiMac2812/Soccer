import React, { useMemo } from 'react';
import { useMatches } from '../../hooks/useMatches';
import LeagueGroup from './LeagueGroup';
import useAppStore from '../../store/appStore';
import styles from './MatchList.module.css';

export default function MatchList() {
    const { status, date, searchQuery, activeMatchId, setActiveMatchId } = useAppStore();
    const { data: matches = [], isLoading, isError, error, isFetching } = useMatches(status, date);

    // Filter by search query
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return matches;
        const q = searchQuery.toLowerCase();
        return matches.filter((m) => {
            const home = (m.home_name || m.home?.name || '').toLowerCase();
            const away = (m.away_name || m.away?.name || '').toLowerCase();
            const league = (m.league_name || m.league?.name || '').toLowerCase();
            return home.includes(q) || away.includes(q) || league.includes(q);
        });
    }, [matches, searchQuery]);

    // Group by league
    const groups = useMemo(() => {
        const map = new Map();
        filtered.forEach((m) => {
            const key = m.league_name || m.league?.name || m.competition_name || 'Giải khác';
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(m);
        });
        return [...map.entries()];
    }, [filtered]);

    if (isLoading) {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
                <p>Đang tải...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.center}>
                <span>❌</span>
                <p>{error?.response?.data?.message || error?.message || 'Lỗi kết nối API'}</p>
                <small>Kiểm tra API Key trong file .env</small>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className={styles.center}>
                <span className={styles.emptyIcon}>🏟️</span>
                <p>{searchQuery ? 'Không tìm thấy trận nào' : 'Không có trận đấu'}</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {isFetching && <div className={styles.refreshBar} />}
            {groups.map(([league, ms]) => (
                <LeagueGroup
                    key={league}
                    league={league}
                    matches={ms}
                    status={status}
                    activeMatchId={activeMatchId}
                    onSelect={setActiveMatchId}
                />
            ))}
        </div>
    );
}
