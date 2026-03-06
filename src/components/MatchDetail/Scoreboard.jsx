import { MATCH_STATUS } from '../../config/api';
import styles from './Scoreboard.module.css';

/**
 * API v2 field mapping for match detail (after normalisation in useMatchDetail):
 *  - teams: match.teams.home.name / .logo / .image
 *  - score: match.score.current.home / .away  OR  match.score.display
 *  - league: match.league.name OR match._league_name
 *  - time: match.time.elapsed (minute) / match.time.kickoff
 */
export default function Scoreboard({ match: m, status }) {
    // Team info
    const homeName = m.teams?.home?.name || m.home_name || 'Home';
    const awayName = m.teams?.away?.name || m.away_name || 'Away';
    const homeLogo = m.teams?.home?.logo || m.teams?.home?.image || m.home_image || '';
    const awayLogo = m.teams?.away?.logo || m.teams?.away?.image || m.away_image || '';

    // Score
    const homeScore = m.score?.current?.home ?? m.home_score ?? null;
    const awayScore = m.score?.current?.away ?? m.away_score ?? null;

    // League + status
    const leagueName = m.league?.name || m._league_name || m.league_name || '';
    const minute = m.time?.elapsed || m.minute || '';
    const kickoff = m.time?.kickoff || m.kickoff || m.start_at || '';

    const isLive = status === MATCH_STATUS.LIVE;
    const isUpcoming = status === MATCH_STATUS.UPCOMING;

    return (
        <div className={styles.board}>
            {leagueName && (
                <div className={styles.league}>
                    <span>🏆</span>
                    <span className={styles.leagueName}>{leagueName}</span>
                    <StatusBadge status={status} minute={minute} kickoff={kickoff} />
                </div>
            )}

            <div className={styles.teams}>
                <TeamCol name={homeName} logo={homeLogo} />

                <div className={styles.scoreBox}>
                    {homeScore !== null && homeScore !== undefined ? (
                        <div className={styles.scoreRow}>
                            <span className={styles.scoreNum}>{homeScore}</span>
                            <span className={styles.scoreSep}>:</span>
                            <span className={styles.scoreNum}>{awayScore}</span>
                        </div>
                    ) : (
                        <div className={styles.scoreVs}>VS</div>
                    )}
                    {isLive && minute && <div className={styles.minute}>{minute}'</div>}
                    {isUpcoming && kickoff && <div className={styles.kickoff}>{fmtDatetime(kickoff)}</div>}
                    {!isLive && !isUpcoming && <div className={styles.ft}>Full Time</div>}
                </div>

                <TeamCol name={awayName} logo={awayLogo} />
            </div>
        </div>
    );
}

function TeamCol({ name, logo }) {
    return (
        <div className={styles.team}>
            {logo ? (
                <img src={logo} alt={name} className={styles.logo} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
                <span className={styles.logoFallback}>⚽</span>
            )}
            <span className={styles.teamName}>{name}</span>
        </div>
    );
}

function StatusBadge({ status, minute, kickoff }) {
    if (status === MATCH_STATUS.LIVE) {
        return (
            <span className={`${styles.badge} ${styles.badgeLive}`}>
                <span className={styles.dot} /> LIVE {minute ? `${minute}'` : ''}
            </span>
        );
    }
    if (status === MATCH_STATUS.UPCOMING) {
        return <span className={`${styles.badge} ${styles.badgeUpcoming}`}>🕐 {fmtDatetime(kickoff)}</span>;
    }
    return <span className={`${styles.badge} ${styles.badgeFinished}`}>✅ Kết thúc</span>;
}

function fmtDatetime(str) {
    if (!str) return '';
    try {
        return new Date(str).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    } catch { return str; }
}
