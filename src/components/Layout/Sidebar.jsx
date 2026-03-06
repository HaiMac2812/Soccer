import useAppStore from '../../store/appStore';
import { MATCH_STATUS } from '../../config/api';
import MatchList from '../MatchList/MatchList';
import styles from './Sidebar.module.css';

const TABS = [
    { id: MATCH_STATUS.LIVE, label: '🔴 Trực Tiếp' },
    { id: MATCH_STATUS.UPCOMING, label: '🕐 Sắp Diễn Ra' },
    { id: MATCH_STATUS.FINISHED, label: '✅ Kết Quả' },
];

export default function Sidebar() {
    const { status, date, searchQuery, setStatus, setDate, setSearchQuery } = useAppStore();

    const changeDate = (delta) => {
        const d = new Date(date);
        d.setDate(d.getDate() + delta);
        setDate(d.toISOString().slice(0, 10));
    };

    return (
        <aside className={styles.sidebar}>
            {/* Tab bar */}
            <div className={styles.tabs}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        className={`${styles.tab} ${status === t.id ? styles.tabActive : ''}`}
                        onClick={() => setStatus(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Date picker */}
            <div className={styles.datebar}>
                <button className={styles.navBtn} onClick={() => changeDate(-1)}>‹</button>
                <input
                    type="date"
                    className={styles.dateInput}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <button className={styles.navBtn} onClick={() => changeDate(1)}>›</button>
            </div>

            {/* Search */}
            <div className={styles.searchWrap}>
                <input
                    type="text"
                    className={styles.search}
                    placeholder="🔍 Tìm đội bóng, giải đấu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Match list */}
            <MatchList />
        </aside>
    );
}
