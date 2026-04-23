(() => {
  const STAMP = 'data-pixelsnitch';

  const CAMERA_SVG = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>`;

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

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Capture as PNG (PixelSnitch)';
    btn.setAttribute('aria-label', 'Capture post as PNG');
    btn.innerHTML = CAMERA_SVG;
    btn.style.cssText = [
      'background:transparent',
      'border:none',
      'color:rgb(113,118,123)',
      'cursor:pointer',
      'padding:4px',
      'border-radius:9999px',
      'width:28px',
      'height:28px',
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'transition:color 120ms, background-color 120ms',
    ].join(';');
    btn.addEventListener('mouseenter', () => {
      btn.style.color = '#1d9bf0';
      btn.style.backgroundColor = 'rgba(29,155,240,0.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.color = 'rgb(113,118,123)';
      btn.style.backgroundColor = 'transparent';
    });

    wrap.appendChild(btn);
    return { wrap, btn };
  }

  async function onClick(article, btn) {
    const original = btn.innerHTML;
    btn.style.opacity = '0.6';
    try {
      const setup = await getSetupState();
      if (!setup) {
        openOptions();
        return;
      }
      const data = await window.pixelSnitchExtract.extractPost(article);
      await window.pixelSnitchCapture.captureAndDownload(data);
      btn.innerHTML = '<span style="font-size:14px;line-height:1;">✓</span>';
      setTimeout(() => { btn.innerHTML = original; }, 900);
    } catch (err) {
      console.error('[pixelsnitch] capture failed', err);
      btn.innerHTML = '<span style="font-size:14px;line-height:1;">!</span>';
      setTimeout(() => { btn.innerHTML = original; }, 1200);
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
