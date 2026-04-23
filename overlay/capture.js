(() => {
  const { renderCard, applyStage, DEFAULT_SETTINGS } = window.pixelSnitchCard;

  let cachedCss = null;
  let cachedFontDataUrl = null;

  async function loadFontDataUrl() {
    if (cachedFontDataUrl) return cachedFontDataUrl;
    const url = chrome.runtime.getURL('vendor/fonts/Inter.woff2');
    const res = await fetch(url);
    const blob = await res.blob();
    cachedFontDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    return cachedFontDataUrl;
  }

  async function loadCss() {
    if (cachedCss) return cachedCss;
    const [cssRaw, fontData] = await Promise.all([
      fetch(chrome.runtime.getURL('overlay/overlay.css')).then(r => r.text()),
      loadFontDataUrl(),
    ]);
    // Replace the relative font url() (which would resolve against x.com in a
    // shadow root) with an inline data URL so html-to-image can embed it.
    cachedCss = cssRaw.replace(
      /url\(['"]?\.\.\/vendor\/fonts\/Inter\.woff2['"]?\)/g,
      `url('${fontData}')`
    );
    return cachedCss;
  }

  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['lastSettings'], (res) => {
        resolve({ ...DEFAULT_SETTINGS, ...(res.lastSettings || {}) });
      });
    });
  }

  // Preload Inter on the host page too, so document.fonts knows about it before
  // html-to-image's SVG foreignObject rasterizes.
  async function ensureFontLoaded() {
    if (!document.fonts || document.fonts.check('16px Inter')) return;
    const fontData = await loadFontDataUrl();
    const face = new FontFace('Inter', `url(${fontData}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
      display: 'block',
    });
    await face.load();
    document.fonts.add(face);
  }

  async function captureAndDownload(data) {
    await ensureFontLoaded();
    const css = await loadCss();
    const settings = await loadSettings();

    const host = document.createElement('div');
    host.style.cssText = 'position:fixed; left:-10000px; top:0; pointer-events:none; z-index:-1;';
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${css}</style>
      <div class="ps-stage" data-role="stage">
        <div class="ps-card theme-dark" data-role="card"></div>
      </div>
    `;
    const stage = shadow.querySelector('[data-role="stage"]');
    const card = shadow.querySelector('[data-role="card"]');
    card.innerHTML = renderCard(data, settings);
    applyStage(stage, card, settings);

    // Wait for Inter + images to settle before rasterizing.
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      await window.pixelSnitchRender.downloadFromNode(stage, {
        handle: data.handle,
        tweetId: data.tweetId,
      });
    } finally {
      host.remove();
    }
  }

  window.pixelSnitchCapture = { captureAndDownload };
})();
