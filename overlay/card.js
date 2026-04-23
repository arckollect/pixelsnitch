(() => {
  const { BACKGROUND_PRESETS, ASPECT_RATIOS } = window.xstampedTemplates;

  const DEFAULT_SETTINGS = {
    theme: 'dark',
    backgroundId: 'twilight',
    customBg: null,
    aspectId: 'auto',
    cardWidth: 560,
    cardScale: 100, // percentage, 100 = 1x uniform scale
    autoMargin: 40, // canvas breathing room in Auto mode only
    customPosition: false,
    posX: 0,
    posY: 0,
    showCounts: true,
    showTimestamp: true,
    showVerified: true,
    redact: false,
  };

  const REDACT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="#536471"/><circle cx="24" cy="18" r="8" fill="#a8b0b7"/><path d="M8 44c2-8 8-12 16-12s14 4 16 12" fill="#a8b0b7"/></svg>'
  );

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
      const day = d.getDate();
      const month = d.toLocaleDateString(undefined, { month: 'short' });
      const year = d.getFullYear();
      return `${time} · ${day} ${month}, ${year}`;
    } catch { return iso; }
  }

  function renderBody(text) {
    if (!text) return '';
    const paras = String(text).split(/\n{2,}/);
    const html = paras.map(p =>
      `<p class="xs-para">${esc(p).replace(/\n/g, '<br>')}</p>`
    ).join('');
    return `<div class="xs-body">${html}</div>`;
  }

  function renderMedia(data) {
    const photos = (data.photos || []).filter(Boolean);
    if (photos.length > 0) {
      const count = Math.min(photos.length, 4);
      const imgs = photos.slice(0, 4).map(src =>
        `<img src="${esc(src)}" alt="" crossorigin="anonymous">`
      ).join('');
      return `<div class="xs-media count-${count}">${imgs}</div>`;
    }
    if (data.videoPoster) {
      return `<div class="xs-media count-1"><div class="xs-video" style="background-image:url('${esc(data.videoPoster)}');background-size:cover;background-position:center;"></div></div>`;
    }
    return '';
  }

  function renderPoll(poll) {
    if (!poll || !poll.options?.length) return '';
    const rows = poll.options.map(opt => {
      const pct = opt.percent ?? 0;
      return `
        <div class="xs-poll-option">
          <span class="xs-bar" style="width:${pct}%;"></span>
          <span class="xs-label">${esc(opt.label)}</span>
          <span class="xs-pct">${opt.percent != null ? pct + '%' : ''}</span>
        </div>`;
    }).join('');
    return `<div class="xs-poll">${rows}</div>`;
  }

  function renderVerified(show, verified) {
    if (!show || !verified) return '';
    return `<span class="xs-verified" aria-label="verified">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="18" height="18">
        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/>
      </svg>
    </span>`;
  }

  function renderQuote(quote, settings) {
    if (!quote) return '';
    const displayName = settings.redact ? 'User' : (quote.displayName ?? '');
    const handle = settings.redact ? '@user' : (quote.handle ?? '');
    const avatarSrc = settings.redact ? REDACT_AVATAR : (quote.avatar ?? REDACT_AVATAR);
    const media = renderMedia(quote);
    return `
      <div class="xs-quote">
        <div class="xs-head">
          <img class="xs-avatar" src="${esc(avatarSrc)}" alt="" crossorigin="anonymous">
          <div class="xs-head-meta">
            <div class="xs-name-row">
              <span class="xs-name">${esc(displayName)}</span>
              ${renderVerified(settings.showVerified, quote.verified)}
              <span class="xs-handle">${esc(handle)}</span>
            </div>
            ${settings.showTimestamp && quote.datetime ? `<span class="xs-time">${esc(formatDate(quote.datetime))}</span>` : ''}
          </div>
        </div>
        ${renderBody(quote.text)}
        ${media}
      </div>`;
  }

  function renderCard(data, settings) {
    const displayName = settings.redact ? 'User' : (data.displayName ?? '');
    const handle = settings.redact ? '@user' : (data.handle ?? '');
    const avatarSrc = settings.redact ? REDACT_AVATAR : (data.avatar ?? REDACT_AVATAR);
    const time = settings.showTimestamp && data.datetime ? `<div class="xs-time-row"><span class="xs-time">${esc(formatDate(data.datetime))}</span></div>` : '';
    const socialRow = data.socialContext ? `<div class="xs-social">🔁 ${esc(data.socialContext)}</div>` : '';
    const media = renderMedia(data);
    const quoteHtml = renderQuote(data.quote, settings);
    const poll = renderPoll(data.poll);

    const counts = settings.showCounts ? `
      <div class="xs-counts">
        <span><b>${esc(data.counts?.reply ?? '0')}</b>Replies</span>
        <span><b>${esc(data.counts?.retweet ?? '0')}</b>Reposts</span>
        <span><b>${esc(data.counts?.like ?? '0')}</b>Likes</span>
      </div>` : '';

    return `
      ${socialRow}
      <div class="xs-head">
        <img class="xs-avatar" src="${esc(avatarSrc)}" alt="" crossorigin="anonymous">
        <div class="xs-head-meta">
          <div class="xs-name-row">
            <span class="xs-name">${esc(displayName)}</span>
            ${renderVerified(settings.showVerified, data.verified)}
            <span class="xs-handle">${esc(handle)}</span>
          </div>
        </div>
      </div>
      ${renderBody(data.text)}
      ${media}
      ${poll}
      ${quoteHtml}
      ${time}
      ${counts}
    `;
  }

  function backgroundFor(settings) {
    if (settings.customBg) return `url('${settings.customBg}') center/cover no-repeat`;
    const preset = BACKGROUND_PRESETS.find(p => p.id === settings.backgroundId) || BACKGROUND_PRESETS[0];
    return preset.css;
  }

  function applyStage(stage, card, settings) {
    const aspect = ASPECT_RATIOS.find(a => a.id === settings.aspectId) || ASPECT_RATIOS[0];
    const scale = (settings.cardScale ?? 100) / 100;
    const cardWidth = settings.cardWidth ?? 560;

    stage.style.background = backgroundFor(settings);
    card.style.width = `${cardWidth}px`;
    card.style.zoom = String(scale);
    card.style.transform = settings.customPosition
      ? `translate(${settings.posX ?? 0}px, ${settings.posY ?? 0}px)`
      : '';
    card.classList.remove('theme-dark', 'theme-light');
    card.classList.add(`theme-${settings.theme}`);

    if (aspect.id === 'auto') {
      const margin = settings.autoMargin ?? 40;
      stage.style.padding = `${margin}px`;
      stage.style.width = `${cardWidth * scale + 2 * margin}px`;
      stage.style.height = 'auto';
    } else {
      stage.style.padding = '0';
      stage.style.width = `${aspect.width}px`;
      stage.style.height = `${aspect.height}px`;
    }
  }

  const SAMPLE_DATA = {
    tweetId: '1234567890',
    permalink: 'https://x.com/sample/status/1234567890',
    displayName: 'Sample User',
    handle: '@sample',
    datetime: '2026-04-22T18:30:00.000Z',
    text: 'This is a preview of how your captured posts will look.\n\nAdjust the controls on the right to style it.',
    avatar: null,
    photos: [],
    verified: true,
    counts: { reply: '42', retweet: '128', like: '1.2K' },
    videoPoster: null,
    poll: null,
    socialContext: null,
    quote: null,
  };

  window.xstampedCard = {
    DEFAULT_SETTINGS,
    renderCard,
    applyStage,
    backgroundFor,
    SAMPLE_DATA,
  };
})();
