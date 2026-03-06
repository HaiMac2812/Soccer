import { useState, useEffect } from 'react';
import styles from './Settings.module.css';

const STORAGE_KEY = 'sportsrc_api_key';

/** Read API key: localStorage first, then .env fallback */
export function getStoredApiKey() {
    return localStorage.getItem(STORAGE_KEY) ||
        import.meta.env.VITE_SPORTSRC_API_KEY || '';
}

export default function Settings({ onClose }) {
    const [key, setKey] = useState('');
    const [saved, setSaved] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setKey(getStoredApiKey());
    }, []);

    const handleSave = () => {
        const trimmed = key.trim();
        if (trimmed) {
            localStorage.setItem(STORAGE_KEY, trimmed);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose?.();
            // Reload so axios interceptor picks up the new key
            window.location.reload();
        }, 800);
    };

    const handleClear = () => {
        localStorage.removeItem(STORAGE_KEY);
        setKey('');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>⚙️ Cài đặt</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.body}>
                    <label className={styles.label}>
                        🔑 API Key <span className={styles.hint}>(sportsrc.org)</span>
                    </label>

                    <div className={styles.inputRow}>
                        <input
                            type={visible ? 'text' : 'password'}
                            className={styles.input}
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Dán API key vào đây..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            spellCheck={false}
                            autoComplete="off"
                        />
                        <button
                            className={styles.eyeBtn}
                            onClick={() => setVisible((v) => !v)}
                            title={visible ? 'Ẩn' : 'Hiện'}
                        >
                            {visible ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <p className={styles.helpText}>
                        Đăng ký miễn phí tại{' '}
                        <a href="https://my.sportsrc.org/register/" target="_blank" rel="noopener">
                            my.sportsrc.org
                        </a>. Key lưu trong <code>localStorage</code> của trình duyệt.
                    </p>

                    <div className={styles.actions}>
                        <button className={styles.clearBtn} onClick={handleClear}>
                            Xóa key
                        </button>
                        <button
                            className={`${styles.saveBtn} ${saved ? styles.savedBtn : ''}`}
                            onClick={handleSave}
                        >
                            {saved ? '✅ Đã lưu!' : 'Lưu & Reload'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
