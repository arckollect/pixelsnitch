(() => {
  const STAMP = 'data-pixelsnitch';

  const COBALT = '#2855FF';
  const LIME = '#DFFF70';
  const INK = '#171B24';
  const X_RED = '#f4212e';
  const brand = window.pixelSnitchBrand;

  const ICON_CSS = 'height:14px;width:auto;display:block;';
  const CHECK_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

  const X_ICON_GRAY = 'rgb(113, 118, 123)';

  // Match the color of X's own action icons (reply/repost/like) in the same
  // action bar, whatever theme is active. Falls back to X's default gray.
  function nativeIconColor(btn) {
    const group = btn.closest('[role="group"]');
    const sibling = group && group.querySelector(':scope > :not([data-pixelsnitch-btn]) svg');
    const c = sibling && getComputedStyle(sibling).color;
    return c && c !== 'rgba(0, 0, 0, 0)' ? c : X_ICON_GRAY;
  }

  // X sets its theme as the body background: white (light), #15202b (dim), #000 (lights out).
  function isDarkTheme() {
    const m = getComputedStyle(document.body).backgroundColor.match(/\d+(\.\d+)?/g);
    if (!m || m.length < 3) return false;
    const [r, g, b] = m.map(Number);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;
  }

  // Rest: the mark in X's icon gray.
  // Hover: cobalt mark on X light, the green mark (brand/mark-green.svg) on X dark.
  function renderMark(btn, hover) {
    const dark = isDarkTheme();
    if (hover && dark) {
      btn.innerHTML = brand.markGreenSvg();
    } else {
      btn.innerHTML = brand.markSvg();
      btn.style.color = hover ? COBALT : nativeIconColor(btn);
    }
    btn.querySelector('svg').style.cssText = ICON_CSS;
    return dark;
  }

  function getSetupState() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['isSetup'], (res) => resolve(!!res.isSetup));
    });
  }

  function openOptions() {
    chrome.runtime.sendMessage({ type: 'pixelsnitch:open-options' }).catch(() => {});
  }

  function makeButton() {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-pixelsnitch-btn', '1');
    wrap.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'flex:0 0 auto',
      'margin-left:auto',
      'height:100%',
    ].join(';');

    // Icon-only brand mark; color and hover treatment follow X's theme.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Capture as PNG (pixelsnitch)';
    btn.setAttribute('aria-label', 'Capture post as PNG');
    btn.style.cssText = [
      'background:transparent',
      'border:none',
      `color:${X_ICON_GRAY}`,
      'cursor:pointer',
      'padding:0',
      'width:28px',
      'height:28px',
      'border-radius:9999px',
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'transition:background-color 120ms',
    ].join(';');

    const applyTheme = () => {
      if (!btn.dataset.state) renderMark(btn, btn.matches(':hover'));
    };
    const setState = (state) => {
      const hover = state === 'hover';
      const dark = renderMark(btn, hover);
      btn.style.backgroundColor = hover
        ? (dark ? 'rgba(223,255,112,0.12)' : 'rgba(40,85,255,0.1)')
        : 'transparent';
    };
    btn.addEventListener('mouseenter', () => { if (!btn.dataset.state) setState('hover'); });
    btn.addEventListener('mouseleave', () => { if (!btn.dataset.state) setState('rest'); });
    btn._applyTheme = applyTheme;
    btn._setState = setState;
    applyTheme();

    wrap.appendChild(btn);
    return { wrap, btn };
  }

  // Brief feedback in place of the mark: lime disc + check (brand "Copied" treatment).
  function flash(btn, kind = 'done', ms = 1100) {
    btn.dataset.state = kind;
    if (kind === 'done') {
      btn.innerHTML = CHECK_SVG;
      btn.style.backgroundColor = LIME;
      btn.style.color = INK;
    } else {
      btn.innerHTML = '<span style="font:700 14px/1 sans-serif;">!</span>';
      btn.style.backgroundColor = 'transparent';
      btn.style.color = X_RED;
    }
    setTimeout(() => {
      delete btn.dataset.state;
      btn.style.backgroundColor = 'transparent';
      btn._applyTheme();
    }, ms);
  }

  // Re-sync the rest color when X switches themes (it swaps body styles in place).
  const themeObserver = new MutationObserver(() => {
    document.querySelectorAll('[data-pixelsnitch-btn] button').forEach(b => b._applyTheme && b._applyTheme());
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

  async function onClick(article, btn) {
    btn.style.opacity = '0.6';
    try {
      const setup = await getSetupState();
      if (!setup) {
        openOptions();
        return;
      }
      const data = await window.pixelSnitchExtract.extractPost(article);
      const settings = await window.pixelSnitchCapture.loadSettings();
      if (settings.captureAction === 'edit') {
        await new Promise(r => chrome.storage.local.set({ pendingCapture: { data, ts: Date.now() } }, r));
        chrome.runtime.sendMessage({ type: 'pixelsnitch:open-editor' }).catch(() => {});
        flash(btn, 'done');
        return;
      }
      await window.pixelSnitchCapture.captureAndDownload(data);
      flash(btn, 'done');
    } catch (err) {
      console.error('[pixelsnitch] capture failed', err);
      flash(btn, 'error', 1200);
    } finally {
      btn.style.opacity = '1';
    }
  }

  function inject(article) {
    if (article.hasAttribute(STAMP)) return;
    const group = article.querySelector('[role="group"]');
    if (!group) return;

    const { wrap, btn } = makeButton();
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(article, btn);
    });

    group.appendChild(wrap);
    article.setAttribute(STAMP, '1');
  }

  function scan(root = document) {
    const nodes = root.querySelectorAll?.('article[data-testid="tweet"]') || [];
    nodes.forEach(inject);
  }

  scan();

  const observer = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches?.('article[data-testid="tweet"]')) inject(n);
        scan(n);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
