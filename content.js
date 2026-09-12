(() => {
  const STAMP = 'data-pixelsnitch';

  const COBALT = '#2855FF';
  const LIME = '#DFFF70';
  const INK = '#171B24';
  const MARK_SVG = window.pixelSnitchBrand.markSvg();

  const FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  function label(text) {
    return `${MARK_SVG}<span>${text}</span>`;
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

    // Brand "Capture" pill: cobalt mark + label, lime fill on success.
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Capture as PNG (pixelsnitch)';
    btn.setAttribute('aria-label', 'Capture post as PNG');
    btn.innerHTML = label('Capture');
    btn.style.cssText = [
      `background:transparent`,
      `border:1px solid rgba(40,85,255,0.35)`,
      `color:${COBALT}`,
      `font:600 13px/1 ${FONT}`,
      'cursor:pointer',
      'padding:0 10px 0 8px',
      'height:28px',
      'border-radius:9999px',
      'display:inline-flex',
      'align-items:center',
      'gap:6px',
      'white-space:nowrap',
      'transition:color 120ms, background-color 120ms, border-color 120ms',
    ].join(';');
    const svg = btn.querySelector('svg');
    if (svg) svg.style.cssText = 'height:13px;width:auto;display:block;flex:0 0 auto;';
    const setState = (state) => {
      if (state === 'done') {
        btn.style.backgroundColor = LIME;
        btn.style.borderColor = LIME;
        btn.style.color = INK;
      } else if (state === 'hover') {
        btn.style.backgroundColor = 'rgba(40,85,255,0.08)';
        btn.style.borderColor = COBALT;
        btn.style.color = COBALT;
      } else {
        btn.style.backgroundColor = 'transparent';
        btn.style.borderColor = 'rgba(40,85,255,0.35)';
        btn.style.color = COBALT;
      }
    };
    btn.addEventListener('mouseenter', () => { if (!btn.dataset.state) setState('hover'); });
    btn.addEventListener('mouseleave', () => { if (!btn.dataset.state) setState('rest'); });
    btn._setState = setState;

    wrap.appendChild(btn);
    return { wrap, btn };
  }

  function flash(btn, text, ms = 1100) {
    btn.dataset.state = 'done';
    btn.innerHTML = `<span>${text}</span><span aria-hidden="true">✓</span>`;
    btn._setState('done');
    setTimeout(() => {
      delete btn.dataset.state;
      btn.innerHTML = label('Capture');
      const svg = btn.querySelector('svg');
      if (svg) svg.style.cssText = 'height:13px;width:auto;display:block;flex:0 0 auto;';
      btn._setState('rest');
    }, ms);
  }

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
        flash(btn, 'Opening');
        return;
      }
      const mode = await window.pixelSnitchCapture.captureAndDownload(data);
      flash(btn, mode === 'clipboard' ? 'Copied' : 'Saved');
    } catch (err) {
      console.error('[pixelsnitch] capture failed', err);
      btn.innerHTML = '<span>Failed</span>';
      setTimeout(() => {
        btn.innerHTML = label('Capture');
        const svg = btn.querySelector('svg');
        if (svg) svg.style.cssText = 'height:13px;width:auto;display:block;flex:0 0 auto;';
      }, 1200);
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
