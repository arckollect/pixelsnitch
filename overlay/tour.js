(() => {
  const STEPS = [
    {
      id: 'welcome',
      target: null,
      tab: null,
      title: 'Welcome to PixelSnitch',
      body: 'Turn any tweet into a polished PNG. Tweak the look here, then hit the camera icon on any post in x.com.',
    },
    {
      id: 'style',
      target: '.tab-btn[data-tab="style"]',
      tab: 'style',
      title: 'Style',
      body: 'Pick a theme, background, and what info shows on the card — timestamp, verified badge, reposted-by line, and so on.',
    },
    {
      id: 'frame',
      target: '.tab-btn[data-tab="frame"]',
      tab: 'frame',
      title: 'Frame',
      body: 'Choose an aspect ratio (Auto, 1:1, 16:9, 9:16…) and adjust the post size. Advanced options let you nudge the card manually.',
    },
    {
      id: 'capture',
      target: '.tab-btn[data-tab="capture"]',
      tab: 'capture',
      title: 'Capture',
      body: 'Decide what happens when you click the camera icon: download the PNG, open the editor first, or copy straight to your clipboard.',
    },
    {
      id: 'finale',
      target: null,
      tab: null,
      title: 'You\'re ready',
      body: 'Open any tweet on x.com and click the camera icon — PixelSnitch does the rest. You can replay this tour any time from the footer.',
    },
  ];

  let stepIdx = 0;
  let root = null;
  let spotlight = null;
  let tip = null;
  let titleEl = null;
  let bodyEl = null;
  let progressEl = null;
  let backBtn = null;
  let nextBtn = null;
  let skipBtn = null;
  let keyHandler = null;
  let resizeHandler = null;
  let active = false;

  function buildDom() {
    root = document.createElement('div');
    root.className = 'ps-tour-root';
    root.innerHTML = `
      <div class="ps-tour-backdrop"></div>
      <div class="ps-tour-spotlight"></div>
      <div class="ps-tour-tip" role="dialog" aria-modal="true" aria-labelledby="ps-tour-title">
        <div class="ps-tour-progress"></div>
        <div class="ps-tour-title" id="ps-tour-title"></div>
        <div class="ps-tour-body"></div>
        <div class="ps-tour-actions">
          <button class="ps-tour-skip" type="button">Skip</button>
          <div class="ps-tour-spacer"></div>
          <button class="ps-tour-back" type="button">Back</button>
          <button class="ps-tour-next" type="button">Next</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    spotlight = root.querySelector('.ps-tour-spotlight');
    tip = root.querySelector('.ps-tour-tip');
    titleEl = root.querySelector('.ps-tour-title');
    bodyEl = root.querySelector('.ps-tour-body');
    progressEl = root.querySelector('.ps-tour-progress');
    backBtn = root.querySelector('.ps-tour-back');
    nextBtn = root.querySelector('.ps-tour-next');
    skipBtn = root.querySelector('.ps-tour-skip');

    backBtn.addEventListener('click', () => go(stepIdx - 1));
    nextBtn.addEventListener('click', () => {
      if (stepIdx >= STEPS.length - 1) finish();
      else go(stepIdx + 1);
    });
    skipBtn.addEventListener('click', () => finish());
    root.querySelector('.ps-tour-backdrop').addEventListener('click', () => finish());
  }

  function activateTab(tabId) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    btn?.click();
  }

  function placeTooltip(targetEl) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tipRect = tip.getBoundingClientRect();
    const tipW = tipRect.width;
    const tipH = tipRect.height;

    if (!targetEl) {
      tip.style.left = `${Math.max(16, (vw - tipW) / 2)}px`;
      tip.style.top = `${Math.max(16, vh * 0.38)}px`;
      return;
    }

    const r = targetEl.getBoundingClientRect();
    const gap = 14;
    let top = r.bottom + gap;
    if (top + tipH > vh - 16) top = r.top - tipH - gap;
    if (top < 16) top = 16;

    let left = r.left + r.width / 2 - tipW / 2;
    if (left < 16) left = 16;
    if (left + tipW > vw - 16) left = vw - tipW - 16;

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  function placeSpotlight(targetEl) {
    if (!targetEl) return;
    const r = targetEl.getBoundingClientRect();
    const pad = 8;
    spotlight.style.left = `${r.left - pad}px`;
    spotlight.style.top = `${r.top - pad}px`;
    spotlight.style.width = `${r.width + pad * 2}px`;
    spotlight.style.height = `${r.height + pad * 2}px`;
  }

  function reposition() {
    const step = STEPS[stepIdx];
    const targetEl = step.target ? document.querySelector(step.target) : null;
    placeSpotlight(targetEl);
    placeTooltip(targetEl);
  }

  function render() {
    const step = STEPS[stepIdx];
    const total = STEPS.length;
    const hasTarget = !!step.target;

    root.classList.toggle('no-target', !hasTarget);

    if (step.tab) activateTab(step.tab);

    progressEl.textContent = `${stepIdx + 1} / ${total}`;
    titleEl.textContent = step.title;
    bodyEl.textContent = step.body;
    backBtn.disabled = stepIdx === 0;
    nextBtn.textContent = stepIdx === total - 1 ? 'Done' : 'Next';

    requestAnimationFrame(() => {
      reposition();
    });
  }

  function go(idx) {
    if (idx < 0 || idx >= STEPS.length) return;
    stepIdx = idx;
    render();
  }

  function finish() {
    if (!active) return;
    active = false;
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('scroll', resizeHandler, true);
    document.removeEventListener('keydown', keyHandler);
    if (root) root.remove();
    root = spotlight = tip = titleEl = bodyEl = progressEl = backBtn = nextBtn = skipBtn = null;
    try { chrome.storage.local.set({ tourSeen: true }); } catch {}
  }

  function start() {
    if (active) return;
    active = true;
    stepIdx = 0;
    buildDom();

    keyHandler = (e) => {
      if (!active) return;
      if (e.key === 'Escape') { e.preventDefault(); finish(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (stepIdx > 0) go(stepIdx - 1); }
    };
    resizeHandler = () => reposition();

    document.addEventListener('keydown', keyHandler);
    window.addEventListener('resize', resizeHandler, { passive: true });
    window.addEventListener('scroll', resizeHandler, { passive: true, capture: true });

    render();
  }

  async function shouldAutoStart({ isFirstRun, isEditMode }) {
    if (isEditMode) return false;
    if (!isFirstRun) return false;
    const stored = await new Promise(r => chrome.storage.local.get(['tourSeen'], r));
    return !stored.tourSeen;
  }

  window.pixelSnitchTour = { start, shouldAutoStart };
})();
