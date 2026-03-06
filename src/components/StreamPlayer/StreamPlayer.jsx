import { useState, useEffect } from 'react';
import { MATCH_STATUS } from '../../config/api';
import styles from './StreamPlayer.module.css';

/**
 * StreamPlayer — renders stream embeds from sportsrc.org detail endpoint.
 *
 * API v2: match._sources = [{ id, embedUrl, source, hd }]
 *
 * CRITICAL PER API SPEC: <iframe> MUST NOT have `sandbox` attribute.
 * If the stream cannot be embedded (X-Frame-Options block), a fallback
 * "Mở trong tab mới" button is shown.
 */
export default function StreamPlayer({ match, status }) {
    const isLive = status === MATCH_STATUS.LIVE;
    const isFinished = status === MATCH_STATUS.FINISHED;
    const isUpcoming = status === MATCH_STATUS.UPCOMING;

    const streams = buildStreamList(match);

    const [activeIdx, setActiveIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [blocked, setBlocked] = useState(false);   // iframe blocked by X-Frame-Options
    const [loadTimeout, setLoadTimeout] = useState(null);

    // Reset state when match/tab changes
    useEffect(() => {
        setActiveIdx(0);
        setLoading(true);
        setBlocked(false);
    }, [match?.id, match?.match_id]);

    const handleTabChange = (i) => {
        setActiveIdx(i);
        setLoading(true);
        setBlocked(false);
        if (loadTimeout) clearTimeout(loadTimeout);
    };

    const handleIframeLoad = () => {
        setLoading(false);
        setBlocked(false);
        if (loadTimeout) clearTimeout(loadTimeout);
    };

    // If iframe fires an error or takes too long and stays blank, detect block
    const handleIframeError = () => {
        setLoading(false);
        setBlocked(true);
    };

    // Start a timeout — if iframe doesn't fire onLoad within 12s, show fallback
    useEffect(() => {
        if (!loading) return;
        const t = setTimeout(() => {
            // After timeout, hide spinner but keep iframe visible (may still load)
            setLoading(false);
        }, 12_000);
        setLoadTimeout(t);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeIdx, match?.id]);

    // Upcoming — no stream ever
    if (isUpcoming) {
        return (
            <div className={styles.noStream}>
                <span>🕐</span>
                <p>Trận chưa bắt đầu</p>
                <small>Stream sẽ xuất hiện khi trận bắt đầu.</small>
            </div>
        );
    }

    // No sources from API
    if (streams.length === 0) {
        return (
            <div className={styles.noStream}>
                <span>{isLive ? '📡' : '🎞️'}</span>
                <p>{isLive ? 'Chưa có nguồn phát' : 'Không có video xem lại'}</p>
                <small>
                    {isLive
                        ? 'Stream chưa khả dụng — có thể xuất hiện sau khi trận bắt đầu.'
                        : 'API không cung cấp video replay cho trận này.'}
                </small>
            </div>
        );
    }

    const currentStream = streams[activeIdx];
    const currentUrl = currentStream?.url;

    return (
        <div className={styles.player}>

            {/* Replay label */}
            {isFinished && (
                <div className={styles.replayBar}>
                    <span>🎞️</span> Xem lại trận đấu
                </div>
            )}

            {/* Stream toolbar: source tabs + open-in-tab button */}
            <div className={styles.toolbar}>
                <div className={styles.tabs}>
                    {streams.map((s, i) => (
                        <button
                            key={i}
                            className={`${styles.tab} ${i === activeIdx ? styles.tabActive : ''}`}
                            onClick={() => handleTabChange(i)}
                        >
                            {s.label}
                            {s.hd && <span className={styles.hdBadge}>HD</span>}
                        </button>
                    ))}
                </div>

                {/* Always-visible fallback: open via stream.html wrapper (preserves Referer) */}
                <a
                    href={wrapUrl(currentUrl)}
                    target="_blank"
                    rel="noopener"
                    className={styles.openBtn}
                    title="Mở stream trong tab mới"
                >
                    ↗ Mở tab mới
                </a>
            </div>

            {/* iframe area */}
            <div className={styles.iframeWrap}>
                {/* Loading spinner */}
                {loading && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.spinner} />
                        <p>Đang kết nối luồng phát...</p>
                    </div>
                )}

                {/* Blocked fallback — shown when X-Frame-Options blocks embedding */}
                {blocked && (
                    <div className={styles.blockedOverlay}>
                        <span>🚫</span>
                        <p>Nguồn này không cho phép nhúng</p>
                        <small>Nhấn nút bên dưới để xem trong tab mới</small>
                        <a
                            href={wrapUrl(currentUrl)}
                            target="_blank"
                            rel="noopener"
                            className={styles.openBtnLarge}
                        >
                            ↗ Mở stream trong tab mới
                        </a>
                        {streams.length > 1 && (
                            <p className={styles.tryOther}>Hoặc thử nguồn khác ↑</p>
                        )}
                    </div>
                )}

                {/*
          CRITICAL: NO `sandbox` attribute — required by sportsrc.org API spec.
          Using sandbox breaks the video player's anti-bot checks.
        */}
                <iframe
                    key={`${match?.id}-${activeIdx}`}
                    src={currentUrl}
                    className={styles.frame}
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; camera; microphone"
                    referrerPolicy="no-referrer-when-downgrade"
                    scrolling="no"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title={`Stream ${activeIdx + 1}`}
                />
            </div>
        </div>
    );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildStreamList(match) {
    if (!match) return [];
    const result = [];

    // API v2 primary: _sources[].embedUrl (injected by useMatchDetail)
    const sources = match._sources ?? [];
    if (Array.isArray(sources) && sources.length > 0) {
        sources.forEach((s, i) => {
            const url = s.embedUrl || s.url || s.src || s.link || '';
            if (url) {
                result.push({
                    url,
                    label: s.source ? capitalize(s.source) : `Nguồn ${i + 1}`,
                    hd: !!s.hd,
                });
            }
        });
    }

    // Fallbacks for other API response shapes
    if (result.length === 0) {
        const raw = match.streams ?? match.stream_urls ?? match.stream ?? [];
        if (Array.isArray(raw)) {
            raw.forEach((s, i) => {
                const url = typeof s === 'string' ? s : (s.embedUrl || s.url || s.src || '');
                const label = typeof s === 'object'
                    ? (s.source || s.name || s.label || `Nguồn ${i + 1}`)
                    : `Nguồn ${i + 1}`;
                if (url) result.push({ url, label: capitalize(label), hd: !!s.hd });
            });
        }
    }

    if (result.length === 0) {
        const single = match.stream_url || match.iframe_url || match.embed_url || match.embedUrl || '';
        if (single) result.push({ url: single, label: 'Nguồn 1', hd: false });
    }

    return result;
}

function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Wrap a stream URL in /stream.html so the browser sends a proper Referer
 * header. Direct access to stream URLs is blocked when there's no Referer.
 */
function wrapUrl(url) {
    if (!url) return '';
    return `/stream.html?src=${encodeURIComponent(url)}`;
}
