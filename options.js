(() => {
  const { BACKGROUND_PRESETS, ASPECT_RATIOS } = window.pixelSnitchTemplates;
  const { DEFAULT_SETTINGS, renderCard, applyStage, SAMPLE_DATA } = window.pixelSnitchCard;

  const qs = new URLSearchParams(location.search);
  const isFirstRun = qs.get('firstrun') === '1';

  const el = {
    firstrun:   document.getElementById('firstrun'),
    statusChip: document.getElementById('status-chip'),
    viewport:   document.getElementById('viewport'),
    scale:      document.getElementById('scale'),
    stage:      document.getElementById('stage'),
    card:       document.getElementById('card'),
    qCard:      document.getElementById('q-card'),
    qCardIcon:  document.getElementById('q-card-icon'),
    qResponse:  document.getElementById('q-response'),
    qSize:      document.getElementById('q-size'),
    qVerified:  document.getElementById('q-verified'),
    bgGrid:     document.getElementById('bg-grid'),
    customBg:   document.getElementById('custom-bg'),
    aspectSeg:  document.getElementById('aspect-seg'),
    cardWidth:    document.getElementById('cardwidth'),
    cardWidthLbl: document.getElementById('cardwidth-label'),
    autoMargin:   document.getElementById('automargin'),
    autoMarginLbl:     document.getElementById('automargin-label'),
    autoMarginSection: document.getElementById('auto-margin-section'),
    cardScale:    document.getElementById('cardscale'),
    cardScaleLbl: document.getElementById('cardscale-label'),
    customPosition:  document.getElementById('customPosition'),
    positionCtrls:   document.getElementById('position-controls'),
    posX:      document.getElementById('posx'),
    posXLbl:   document.getElementById('posx-label'),
    posY:      document.getElementById('posy'),
    posYLbl:   document.getElementById('posy-label'),
    posReset:  document.getElementById('pos-reset'),
    showTimestamp: document.getElementById('showTimestamp'),
    redact:     document.getElementById('redact'),
    presetSelect: document.getElementById('preset-select'),
    presetsList:  document.getElementById('presets-list'),
    presetsEmpty: document.getElementById('presets-empty'),
    savePreset:   document.getElementById('save-preset'),
    deletePreset: document.getElementById('delete-preset'),
    saveBtn:      document.getElementById('save'),
    savedNote:    document.getElementById('saved-note'),
    testBtn:      document.getElementById('test-render'),
  };

  const SIZE_STEPS = [75, 100, 125, 150];
  const MOON_SVG = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
  const SUN_SVG = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>`;

  const state = {
    settings: { ...DEFAULT_SETTINGS },
    presets: [],
    isSetup: false,
  };

  function escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderQuickToggles() {
    const s = state.settings;
    el.qCardIcon.innerHTML = s.theme === 'dark' ? MOON_SVG : SUN_SVG;
    el.qCard.classList.toggle('active', s.theme === 'dark');
    el.qResponse.classList.toggle('active', !!s.showCounts);
    el.qVerified.classList.toggle('active', !!s.showVerified);
    el.qSize.classList.toggle('active', s.cardScale !== 100);
  }

  function renderBgGrid() {
    el.bgGrid.innerHTML = BACKGROUND_PRESETS.map(p => `
      <button class="bg-swatch ${p.id === 'none' ? 'is-none' : ''} ${state.settings.backgroundId === p.id && !state.settings.customBg ? 'active' : ''}"
              data-bg-id="${p.id}" title="${escHtml(p.name)}"
              style="${p.id === 'none' ? '' : `background:${p.css};`}">
        <span class="name">${escHtml(p.name)}</span>
      </button>
    `).join('');
  }

  function renderAspectSeg() {
    el.aspectSeg.innerHTML = ASPECT_RATIOS.map(a => `
      <button data-aspect-id="${a.id}" class="${state.settings.aspectId === a.id ? 'active' : ''}">${escHtml(a.name)}</button>
    `).join('');
    el.autoMarginSection.style.display = state.settings.aspectId === 'auto' ? '' : 'none';
  }

  function renderCardWidthLbl() {
    el.cardWidthLbl.textContent = `Width (${state.settings.cardWidth}px)`;
    el.cardWidth.value = String(state.settings.cardWidth);
  }

  function renderAutoMarginLbl() {
    el.autoMarginLbl.textContent = `Canvas margin (${state.settings.autoMargin}px)`;
    el.autoMargin.value = String(state.settings.autoMargin);
  }

  function renderCardScaleLbl() {
    el.cardScaleLbl.textContent = `Post size (${state.settings.cardScale}%)`;
    el.cardScale.value = String(state.settings.cardScale);
  }

  function renderToggles() {
    el.showTimestamp.checked = state.settings.showTimestamp;
    el.redact.checked = state.settings.redact;
  }

  function renderPosition() {
    const on = !!state.settings.customPosition;
    el.customPosition.checked = on;
    el.positionCtrls.style.display = on ? 'flex' : 'none';
    el.posX.value = String(state.settings.posX ?? 0);
    el.posY.value = String(state.settings.posY ?? 0);
    el.posXLbl.textContent = `X offset (${state.settings.posX ?? 0}px)`;
    el.posYLbl.textContent = `Y offset (${state.settings.posY ?? 0}px)`;
  }

  function renderPresetsUI() {
    el.presetSelect.innerHTML = `<option value="">— load preset —</option>` + state.presets.map((p, i) =>
      `<option value="${i}">${escHtml(p.name)}</option>`
    ).join('');
    if (!state.presets.length) {
      el.presetsEmpty.style.display = 'block';
      el.presetsList.innerHTML = '';
    } else {
      el.presetsEmpty.style.display = 'none';
      el.presetsList.innerHTML = state.presets.map((p, i) => `
        <li><span>${escHtml(p.name)}</span>
          <div class="actions">
            <button data-action="load" data-idx="${i}">Load</button>
            <button data-action="delete" data-idx="${i}">Delete</button>
          </div>
        </li>`).join('');
    }
  }

  function renderStatus() {
    const ok = state.isSetup;
    el.statusChip.textContent = ok ? '● Setup complete' : '● Setup pending';
    el.statusChip.classList.toggle('ok', ok);
    el.statusChip.classList.toggle('pending', !ok);
  }

  function autoFit() {
    const wrap = el.viewport;
    const stage = el.stage;
    const pad = 24;
    const availW = wrap.clientWidth - pad * 2;
    const availH = wrap.clientHeight - pad * 2;
    const w = stage.offsetWidth;
    const h = stage.offsetHeight;
    if (!w || !h) return;
    const scale = Math.min(1, availW / w, availH / h);
    stage.style.transform = `scale(${scale})`;
    stage.style.transformOrigin = 'top left';
    el.scale.style.width = `${w * scale}px`;
    el.scale.style.height = `${h * scale}px`;
  }

  function renderPreview() {
    el.card.innerHTML = renderCard(SAMPLE_DATA, state.settings);
    applyStage(el.stage, el.card, state.settings);
    requestAnimationFrame(autoFit);
  }

  function renderControls() {
    renderQuickToggles();
    renderBgGrid();
    renderAspectSeg();
    renderCardWidthLbl();
    renderAutoMarginLbl();
    renderCardScaleLbl();
    renderToggles();
    renderPosition();
    renderPresetsUI();
  }

  function persistSettings() {
    const toSave = { ...state.settings };
    if (toSave.customBg && toSave.customBg.length > 500000) delete toSave.customBg;
    chrome.storage.local.set({ lastSettings: toSave });
  }

  function update(patch, { renderAll = true } = {}) {
    state.settings = { ...state.settings, ...patch };
    persistSettings();
    if (renderAll) renderControls();
    renderPreview();
  }

  function flashSaved(text = 'Saved') {
    el.savedNote.textContent = text;
    el.savedNote.classList.add('visible');
    setTimeout(() => el.savedNote.classList.remove('visible'), 1500);
  }

  // --- Event wiring ---
  el.qCard.addEventListener('click', () => {
    update({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' });
  });

  el.qResponse.addEventListener('click', () => {
    update({ showCounts: !state.settings.showCounts });
  });

  el.qVerified.addEventListener('click', () => {
    update({ showVerified: !state.settings.showVerified });
  });

  el.qSize.addEventListener('click', () => {
    const curr = state.settings.cardScale;
    const idx = SIZE_STEPS.indexOf(curr);
    const next = SIZE_STEPS[(idx + 1) % SIZE_STEPS.length] ?? 100;
    update({ cardScale: next });
  });

  el.bgGrid.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-bg-id]');
    if (b) update({ backgroundId: b.dataset.bgId, customBg: null });
  });

  el.customBg.addEventListener('change', () => {
    const f = el.customBg.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => update({ customBg: r.result, backgroundId: null });
    r.readAsDataURL(f);
  });

  el.aspectSeg.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-aspect-id]');
    if (!b) return;
    const a = ASPECT_RATIOS.find(x => x.id === b.dataset.aspectId);
    update({
      aspectId: b.dataset.aspectId,
      cardScale: a?.defaultScale ?? 100,
      cardWidth: a?.defaultWidth ?? 560,
    });
  });

  el.cardWidth.addEventListener('input', () => {
    update({ cardWidth: parseInt(el.cardWidth.value, 10) }, { renderAll: false });
    renderCardWidthLbl();
  });

  el.autoMargin.addEventListener('input', () => {
    update({ autoMargin: parseInt(el.autoMargin.value, 10) }, { renderAll: false });
    renderAutoMarginLbl();
  });

  el.customPosition.addEventListener('change', () => {
    update({ customPosition: el.customPosition.checked });
  });

  el.posX.addEventListener('input', () => {
    update({ posX: parseInt(el.posX.value, 10) }, { renderAll: false });
    el.posXLbl.textContent = `X offset (${state.settings.posX}px)`;
  });

  el.posY.addEventListener('input', () => {
    update({ posY: parseInt(el.posY.value, 10) }, { renderAll: false });
    el.posYLbl.textContent = `Y offset (${state.settings.posY}px)`;
  });

  el.posReset.addEventListener('click', () => {
    update({ posX: 0, posY: 0 });
  });

  el.cardScale.addEventListener('input', () => {
    update({ cardScale: parseInt(el.cardScale.value, 10) }, { renderAll: false });
    renderCardScaleLbl();
  });

  ['showTimestamp', 'redact'].forEach(key => {
    el[key].addEventListener('change', () => update({ [key]: el[key].checked }, { renderAll: false }));
  });

  el.savePreset.addEventListener('click', async () => {
    const name = prompt('Preset name:');
    if (!name) return;
    state.presets = [...state.presets.filter(p => p.name !== name), { name, settings: { ...state.settings } }];
    await new Promise(r => chrome.storage.local.set({ presets: state.presets }, r));
    renderPresetsUI();
    flashSaved(`Saved "${name}"`);
  });

  el.deletePreset.addEventListener('click', async () => {
    const idx = parseInt(el.presetSelect.value, 10);
    if (Number.isNaN(idx)) { flashSaved('Pick a preset first'); return; }
    const name = state.presets[idx]?.name;
    state.presets = state.presets.filter((_, i) => i !== idx);
    await new Promise(r => chrome.storage.local.set({ presets: state.presets }, r));
    renderPresetsUI();
    flashSaved(`Deleted "${name}"`);
  });

  el.presetSelect.addEventListener('change', () => {
    const idx = parseInt(el.presetSelect.value, 10);
    if (Number.isNaN(idx)) return;
    const p = state.presets[idx];
    if (p) update(p.settings);
  });

  el.presetsList.addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-action]');
    if (!b) return;
    const idx = parseInt(b.dataset.idx, 10);
    if (b.dataset.action === 'load') {
      const p = state.presets[idx];
      if (p) update(p.settings);
      flashSaved(`Loaded "${p?.name}"`);
    } else if (b.dataset.action === 'delete') {
      const name = state.presets[idx]?.name;
      state.presets = state.presets.filter((_, i) => i !== idx);
      await new Promise(r => chrome.storage.local.set({ presets: state.presets }, r));
      renderPresetsUI();
      flashSaved(`Deleted "${name}"`);
    }
  });

  el.saveBtn.addEventListener('click', async () => {
    state.isSetup = true;
    persistSettings();
    await new Promise(r => chrome.storage.local.set({ isSetup: true }, r));
    renderStatus();
    if (isFirstRun) el.firstrun.style.display = 'none';
    flashSaved('Saved & setup complete');
  });

  el.testBtn.addEventListener('click', async () => {
    el.testBtn.disabled = true;
    const prevTransform = el.stage.style.transform;
    el.stage.style.transform = '';
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await window.pixelSnitchRender.downloadFromNode(el.stage, { handle: 'sample', tweetId: 'preview' });
      flashSaved('Sample downloaded');
    } catch (err) {
      console.error('[pixelsnitch] test render failed', err);
      flashSaved('Test render failed');
    } finally {
      el.stage.style.transform = prevTransform;
      el.testBtn.disabled = false;
    }
  });

  window.addEventListener('resize', autoFit);

  // --- Init ---
  async function init() {
    const stored = await new Promise(r =>
      chrome.storage.local.get(['lastSettings', 'presets', 'isSetup'], r)
    );
    state.settings = { ...DEFAULT_SETTINGS, ...(stored.lastSettings || {}) };
    state.presets = stored.presets || [];
    state.isSetup = !!stored.isSetup;

    if (isFirstRun && !state.isSetup) el.firstrun.style.display = 'flex';
    renderStatus();
    renderControls();
    renderPreview();
  }

  init();
})();
