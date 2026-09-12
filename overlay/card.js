(() => {
  const { BACKGROUND_PRESETS, ASPECT_RATIOS } = window.pixelSnitchTemplates;

  const DEFAULT_SETTINGS = {
    theme: 'light',
    backgroundId: 'cobalt',
    customBg: null,
    aspectId: 'auto',
    cardWidth: 480,
    cardScale: 100, // percentage, 100 = 1x uniform scale
    autoMargin: 44, // canvas breathing room in Auto mode only
    customPosition: false,
    posX: 0,
    posY: 0,
    showCounts: true,
    showTimestamp: true,
    showVerified: true,
    showSocialContext: true,
    redact: false,
    captureAction: 'download', // 'download' | 'edit' | 'clipboard'
    customColor: null,   // '#RRGGBB' solid background chosen in the editor
    cardRadius: 6,
    shadow: 'soft',      // 'none' | 'soft' | 'strong'
    watermark: true,     // brand watermark on Cobalt/Lime backgrounds
    exportScale: 2,      // pixelRatio for exported PNGs
  };

  const SHADOWS = {
    none: '',
    soft: '0 8px 24px rgba(0, 0, 0, 0.14)',
    strong: '0 18px 48px rgba(0, 0, 0, 0.3)',
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
      `<p class="ps-para">${esc(p).replace(/\n/g, '<br>')}</p>`
    ).join('');
    return `<div class="ps-body">${html}</div>`;
  }

  function renderMedia(data) {
    const photos = (data.photos || []).filter(Boolean);
    if (photos.length > 0) {
      const count = Math.min(photos.length, 4);
      const imgs = photos.slice(0, 4).map(src =>
        `<img src="${esc(src)}" alt="" crossorigin="anonymous">`
      ).join('');
      return `<div class="ps-media count-${count}">${imgs}</div>`;
    }
    if (data.videoPoster) {
      return `<div class="ps-media count-1"><div class="ps-video" style="background-image:url('${esc(data.videoPoster)}');background-size:cover;background-position:center;"></div></div>`;
    }
    return '';
  }

  function renderPoll(poll) {
    if (!poll || !poll.options?.length) return '';
    const rows = poll.options.map(opt => {
      const pct = opt.percent ?? 0;
      return `
        <div class="ps-poll-option">
          <span class="ps-bar" style="width:${pct}%;"></span>
          <span class="ps-label">${esc(opt.label)}</span>
          <span class="ps-pct">${opt.percent != null ? pct + '%' : ''}</span>
        </div>`;
    }).join('');
    return `<div class="ps-poll">${rows}</div>`;
  }

  function renderVerified(show, verified) {
    if (!show || !verified) return '';
    return `<span class="ps-verified" aria-label="verified">
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
      <div class="ps-quote">
        <div class="ps-head">
          <img class="ps-avatar" src="${esc(avatarSrc)}" alt="" crossorigin="anonymous">
          <div class="ps-head-meta">
            <div class="ps-name-row">
              <span class="ps-name">${esc(displayName)}</span>
              ${renderVerified(settings.showVerified, quote.verified)}
              <span class="ps-handle">${esc(handle)}</span>
            </div>
            ${settings.showTimestamp && quote.datetime ? `<span class="ps-time">${esc(formatDate(quote.datetime))}</span>` : ''}
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
    const time = settings.showTimestamp && data.datetime ? `<div class="ps-time-row"><span class="ps-time">${esc(formatDate(data.datetime))}</span></div>` : '';
    const socialRow = (settings.showSocialContext !== false && data.socialContext) ? `<div class="ps-social">🔁 ${esc(data.socialContext)}</div>` : '';
    const media = renderMedia(data);
    const quoteHtml = renderQuote(data.quote, settings);
    const poll = renderPoll(data.poll);

    const counts = settings.showCounts ? `
      <div class="ps-counts">
        <span><b>${esc(data.counts?.reply ?? '0')}</b>Replies</span>
        <span><b>${esc(data.counts?.retweet ?? '0')}</b>Reposts</span>
        <span><b>${esc(data.counts?.like ?? '0')}</b>Likes</span>
      </div>` : '';

    return `
      ${socialRow}
      <div class="ps-head">
        <img class="ps-avatar" src="${esc(avatarSrc)}" alt="" crossorigin="anonymous">
        <div class="ps-head-meta">
          <div class="ps-name-row">
            <span class="ps-name">${esc(displayName)}</span>
            ${renderVerified(settings.showVerified, data.verified)}
            <span class="ps-handle">${esc(handle)}</span>
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
    if (settings.customColor) return settings.customColor;
    const preset = BACKGROUND_PRESETS.find(p => p.id === settings.backgroundId) || BACKGROUND_PRESETS[0];
    return preset.css;
  }

  // Wordmark watermark: only on the brand backgrounds (Cobalt/Lime), never on
  // custom images or other presets. Lives as a sibling of the card inside the
  // stage so it rasterizes with the canvas.
  function applyWatermark(stage, settings, stageWidth, cardLeft, cardRight) {
    const preset = (settings.customBg || settings.customColor) ? null : BACKGROUND_PRESETS.find(p => p.id === settings.backgroundId);
    const color = settings.watermark === false ? null : (preset?.watermark || null);
    let el = stage.querySelector('.ps-watermark');
    if (!color) {
      if (el) el.remove();
      return 0;
    }
    if (!el) {
      el = document.createElement('div');
      el.className = 'ps-watermark';
      const brand = window.pixelSnitchBrand;
      el.innerHTML = brand.wordmarkSvg('ps-wm-logo') + `<span class="ps-wm-tag">${esc(brand.TAGLINE)}</span>`;
      stage.appendChild(el);
    }
    el.classList.toggle('ps-wm-white', color === 'white');
    el.classList.toggle('ps-wm-black', color === 'black');
    // Keep the watermark proportional to the canvas (fixed aspects are 1080px+ wide).
    const zoom = Math.max(1, stageWidth / 600);
    el.style.zoom = String(zoom);
    // Align to the card's edges. `zoom` scales offsets too, so divide them out.
    el.style.left = `${Math.max(8, cardLeft) / zoom}px`;
    el.style.right = `${Math.max(8, cardRight) / zoom}px`;
    return zoom;
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
    card.style.borderRadius = `${settings.cardRadius ?? 16}px`;
    card.style.boxShadow = SHADOWS[settings.shadow] ?? SHADOWS.soft;
    card.classList.remove('theme-dark', 'theme-light');
    card.classList.add(`theme-${settings.theme}`);

    const renderedCardWidth = cardWidth * scale;
    const offsetX = settings.customPosition ? (settings.posX ?? 0) : 0;

    if (aspect.id === 'auto') {
      const margin = settings.autoMargin ?? 40;
      const stageWidth = cardWidth * scale + 2 * margin;
      const wmZoom = applyWatermark(stage, settings, stageWidth, margin + offsetX, margin - offsetX);
      // Reserve room under the card for the watermark row when it's shown.
      const bottom = wmZoom ? Math.max(margin, Math.round(64 * wmZoom)) : margin;
      stage.style.padding = `${margin}px ${margin}px ${bottom}px`;
      stage.style.width = `${stageWidth}px`;
      stage.style.height = 'auto';
    } else {
      const side = (aspect.width - renderedCardWidth) / 2;
      applyWatermark(stage, settings, aspect.width, side + offsetX, side - offsetX);
      stage.style.padding = '0';
      stage.style.width = `${aspect.width}px`;
      stage.style.height = `${aspect.height}px`;
    }
  }

  const SAMPLE_DATA = {
    tweetId: '1234567890',
    permalink: 'https://x.com/sample/status/1234567890',
    displayName: 'Pug Parker',
    handle: '@spiderpuggy',
    datetime: '2026-04-22T18:30:00.000Z',
    text: 'Some posts deserve better than a messy screenshot.',
    avatar: 'brand/sample-avatar.png', // options page only (relative to options.html)
    photos: [],
    verified: true,
    counts: { reply: '42', retweet: '128', like: '1.2K' },
    videoPoster: null,
    poll: null,
    socialContext: null,
    quote: null,
  };

  window.pixelSnitchCard = {
    DEFAULT_SETTINGS,
    renderCard,
    applyStage,
    backgroundFor,
    SAMPLE_DATA,
  };
})();
