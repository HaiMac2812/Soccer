import React, { useState } from 'react';
import Settings from '../Settings/Settings';
import styles from './Header.module.css';

const STORAGE_KEY = 'sportsrc_api_key';

function getKey() {
    return localStorage.getItem(STORAGE_KEY) ||
        import.meta.env.VITE_SPORTSRC_API_KEY || '';
}

export default function Header() {
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState(getKey);
    const hasKey = !!apiKey;

    return (
        <>
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

                    {/* Right: API status + Settings + Clock */}
                    <div className={styles.right}>
                        <button
                            className={`${styles.keyStatus} ${hasKey ? styles.keyOk : styles.keyMissing}`}
                            onClick={() => setShowSettings(true)}
                            title={hasKey ? 'API Key đã cấu hình — click để đổi' : 'Cần API Key — click để thêm'}
                        >
                            {hasKey ? '🔑 API Key OK' : '⚠️ Chưa có API Key'}
                        </button>

                        <button
                            className={styles.settingsBtn}
                            onClick={() => setShowSettings(true)}
                            title="Cài đặt"
                        >
                            ⚙️
                        </button>

                        <Clock />
                    </div>
                </div>
            </header>

            {/* Settings modal */}
            {showSettings && (
                <Settings onClose={() => {
                    setApiKey(getKey());
                    setShowSettings(false);
                }} />
            )}
        </>
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
