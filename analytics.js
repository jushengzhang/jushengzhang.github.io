// Anonymous first-party visit statistics. Reports are never exposed in this page.
(() => {
  if (location.hostname !== 'jushengzhang.github.io' || location.protocol !== 'https:') return;
  if (navigator.webdriver || navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  const endpoint = 'https://jusheng-analytics-20261031.wangwenhao.chatgpt.site/api/collect';
  const visitorKey = 'jz_analytics_visitor_v1';
  const optOutKey = 'jz_analytics_optout';
  try {
    const option = new URLSearchParams(location.search).get('analytics');
    if (option === 'off') localStorage.setItem(optOutKey, '1');
    if (option === 'on') localStorage.removeItem(optOutKey);
    if (localStorage.getItem(optOutKey) === '1') return;
  } catch { /* Storage may be disabled. The page remains fully usable. */ }

  let sent = false;
  function recordVisit() {
    if (sent || document.visibilityState !== 'visible') return;
    sent = true;
    try {
      let visitorId;
      try { visitorId = localStorage.getItem(visitorKey); } catch { /* Ephemeral ID below. */ }
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId || '')) {
        visitorId = crypto.randomUUID();
        try { localStorage.setItem(visitorKey, visitorId); } catch { /* Per-page anonymous ID. */ }
      }
      let referrer = '';
      try { if (document.referrer) referrer = new URL(document.referrer).hostname; } catch { /* No source. */ }
      const payload = JSON.stringify({ kind: 'pageview', path: '/', visitorId, eventId: crypto.randomUUID(), referrer });
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, payload)) return;
      fetch(endpoint, {
        method: 'POST', body: payload, mode: 'cors', credentials: 'omit', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      }).catch(() => {});
    } catch { /* Analytics must never interrupt the homepage. */ }
  }
  if (document.visibilityState === 'visible') recordVisit();
  else document.addEventListener('visibilitychange', recordVisit);
})();
