import { useMatchDetail } from '../../hooks/useMatchDetail';
import useAppStore from '../../store/appStore';
import Scoreboard from './Scoreboard';
import StreamPlayer from '../StreamPlayer/StreamPlayer';
import styles from './MatchDetail.module.css';

export default function MatchDetail() {
    const { activeMatchId, status } = useAppStore();
    const { data: match, isLoading, isError, error } = useMatchDetail(activeMatchId, status);

    if (!activeMatchId) return <Welcome />;

    if (isLoading && !match) {
        return (
            <div className={styles.center}>
                <div className={styles.spinner} />
                <p>Đang tải chi tiết trận đấu...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.center}>
                <span>❌</span>
                <p>{error?.message || 'Lỗi tải chi tiết'}</p>
            </div>
        );
    }

    if (!match) return null;

    return (
        <div className={styles.detail}>
            <Scoreboard match={match} status={status} />
            <StreamPlayer match={match} status={status} />
            <MatchInfoBar match={match} />
        </div>
    );
}

// ─── Welcome screen ───────────────────────────────────────────────────────────

function Welcome() {
    return (
        <div className={styles.welcome}>
            <div className={styles.welcomeIcon}>⚽</div>
            <h2>Chọn một trận đấu để xem</h2>
            <p>Chọn trận từ danh sách bên trái để xem trực tiếp hoặc kết quả.</p>
            <div className={styles.featureRow}>
                <FeatureCard icon="🎥" label="Xem trực tiếp" />
                <FeatureCard icon="📊" label="Tỉ số & kết quả" />
                <FeatureCard icon="🏆" label="Nhiều giải đấu" />
            </div>
        </div>
    );
}

function FeatureCard({ icon, label }) {
    return (
        <div className={styles.featureCard}>
            <span>{icon}</span>
            <p>{label}</p>
        </div>
    );
}

// ─── Bottom info bar ──────────────────────────────────────────────────────────

function MatchInfoBar({ match: m }) {
    // API v2 field paths with fallbacks
    const venue = m.venue || m.stadium || m.ground || '';
    const referee = m.referee || '';
    const round = m.round || m.week || m.matchday || '';
    const country = m.country || m.league?.country || '';

    const items = [
        venue && ['🏟️', 'Sân', venue],
        referee && ['🟨', 'Trọng tài', referee],
        round && ['📅', 'Vòng', round],
        country && ['🌍', 'Quốc gia', country],
    ].filter(Boolean);

    if (!items.length) return null;

    return (
        <div className={styles.infoBar}>
            {items.map(([icon, label, val]) => (
                <div className={styles.infoItem} key={label}>
                    <span>{icon}</span>
                    <span className={styles.infoLabel}>{label}:</span>
                    <span>{val}</span>
                </div>
            ))}
        </div>
    );
}
