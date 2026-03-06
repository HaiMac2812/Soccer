import { MATCH_STATUS } from '../../config/api';
import styles from './MatchCard.module.css';

/**
 * API v2 field mapping:
 *  - id: match.id  (string like "team-a-team-b-12345")
 *  - home name: match.teams.home.name
 *  - away name: match.teams.away.name
 *  - scores: match.score.current.home / .away
 *  - logos: match.teams.home.logo / match.teams.home.image
 *  - minute: match.time.elapsed or match.minute
 *  - kickoff: match.time.kickoff or match.kickoff
 *  - league: injected as match._league_name by useMatches hook
 */
export default function MatchCard({ match: m, status, isActive, onClick }) {
    const id = m.id || m.match_id;

    // Team info — API v2 uses nested `teams` object
    const homeName = m.teams?.home?.name || m.home_name || m.home?.name || 'Home';
    const awayName = m.teams?.away?.name || m.away_name || m.away?.name || 'Away';
    const homeLogo = m.teams?.home?.logo || m.teams?.home?.image || m.home_image || m.home?.logo || '';
    const awayLogo = m.teams?.away?.logo || m.teams?.away?.image || m.away_image || m.away?.logo || '';

    // Score — API v2: score.current.home / score.current.away
    const homeScore = m.score?.current?.home ?? m.home_score ?? m.home?.score ?? null;
    const awayScore = m.score?.current?.away ?? m.away_score ?? m.away?.score ?? null;

    // Time
    const minute = m.time?.elapsed || m.minute || m.elapsed || '';
    const kickoff = m.time?.kickoff || m.kickoff || m.start_at || '';
    const hasStream = m.has_stream !== false;
    const isLive = status === MATCH_STATUS.LIVE;

    return (
        <div
            className={`${styles.card} ${isActive ? styles.active : ''}`}
            onClick={onClick}
            data-id={id}
        >
            {/* Teams */}
            <div className={styles.teams}>
                <TeamRow name={homeName} logo={homeLogo} />
                <TeamRow name={awayName} logo={awayLogo} />
            </div>

            {/* Score / Time */}
            <div className={styles.scoreCol}>
                {homeScore !== null && homeScore !== undefined ? (
                    <>
                        <span className={styles.score}>{homeScore}</span>
                        <span className={styles.sep}>―</span>
                        <span className={styles.score}>{awayScore}</span>
                    </>
                ) : (
                    <span className={styles.vs}>VS</span>
                )}
            </div>

            {/* Meta */}
            <div className={styles.meta}>
                {isLive && (
                    <span className={styles.minuteBadge}>
                        {minute ? `${minute}'` : 'LIVE'}
                    </span>
                )}
                {status === MATCH_STATUS.UPCOMING && (
                    <span className={styles.timeBadge}>{fmtKickoff(kickoff)}</span>
                )}
                {status === MATCH_STATUS.FINISHED && (
                    <span className={styles.ftBadge}>FT</span>
                )}
                {isLive && hasStream && <span className={styles.streamDot} title="Có stream" />}
            </div>
        </div>
    );
}

function TeamRow({ name, logo }) {
    return (
        <div className={styles.team}>
            {logo ? (
                <img
                    className={styles.logo}
                    src={logo}
                    alt={name}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            ) : (
                <span className={styles.logoFallback}>⚽</span>
            )}
            <span className={styles.teamName}>{name}</span>
        </div>
    );
}

function fmtKickoff(str) {
    if (!str) return 'TBD';
    try {
        return new Date(str).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch { return str; }
}
