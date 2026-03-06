import React from 'react';
import { getApiKey } from '../../config/api';
import styles from './Header.module.css';

export default function Header() {
    const apiKeyLoaded = !!getApiKey();

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>⚽</span>
                    <span className={styles.logoText}>
                        Soccer<span className={styles.logoAccent}>Live</span>
                    </span>
                </div>

                {/* Live badge */}
                <div className={styles.liveBadge}>
                    <span className={styles.liveDot} />
                    <span>LIVE</span>
                </div>

                {/* Status */}
                <div className={styles.right}>
                    {apiKeyLoaded ? (
                        <span className={styles.keyOk} title="API Key đã được cấu hình">🔑 API Key OK</span>
                    ) : (
                        <span className={styles.keyMissing}>
                            ⚠️ Chưa có API Key — Thêm vào <code>.env</code>
                        </span>
                    )}
                    <Clock />
                </div>
            </div>
        </header>
    );
}

function Clock() {
    const [time, setTime] = React.useState(() => fmtTime(new Date()));
    React.useEffect(() => {
        const id = setInterval(() => setTime(fmtTime(new Date())), 1000);
        return () => clearInterval(id);
    }, []);
    return <span className={styles.clock}>{time}</span>;
}

function fmtTime(d) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
