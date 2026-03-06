import MatchCard from './MatchCard';
import styles from './LeagueGroup.module.css';

export default function LeagueGroup({ league, matches, status, activeMatchId, onSelect }) {
    return (
        <div className={styles.group}>
            <div className={styles.header}>
                <span className={styles.icon}>🏆</span>
                <span className={styles.name}>{league}</span>
                <span className={styles.count}>{matches.length}</span>
            </div>
            {matches.map((m) => {
                const id = m.id || m.match_id;
                return (
                    <MatchCard
                        key={id}
                        match={m}
                        status={status}
                        isActive={id === activeMatchId}
                        onClick={() => onSelect(id)}
                    />
                );
            })}
        </div>
    );
}
