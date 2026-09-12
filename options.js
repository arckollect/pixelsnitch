(() => {
  const { BACKGROUND_PRESETS, ASPECT_RATIOS } = window.pixelSnitchTemplates;
  const { DEFAULT_SETTINGS, renderCard, applyStage, SAMPLE_DATA } = window.pixelSnitchCard;

  const qs = new URLSearchParams(location.search);
  const isFirstRun = qs.get('firstrun') === '1';
  const isEditMode = qs.get('edit') === '1';

  const $ = (id) => document.getElementById(id);
  const el = {
    firstrun:   $('firstrun'),
    statusChip: $('status-chip'),
    viewport:   $('viewport'),
    scale:      $('scale'),
    stage:      $('stage'),
    card:       $('card'),
    previewCaption: $('preview-caption'),
    tabNav:     $('tab-nav'),
    tabBtns:    document.querySelectorAll('.tab-btn'),
    tabPanels:  document.querySelectorAll('.tab-panel'),
    themeSeg:   $('theme-seg'),
    bgKindSeg:  $('bg-kind-seg'),
    bgGrid:     $('bg-grid'),
    customBg:   $('custom-bg'),
    uploadFilename: $('upload-filename'),
    uploadClear:    $('upload-clear'),
    customColorField: $('custom-color-field'),
    customColor: $('custom-color'),
    customHex:   $('custom-hex'),
    aspectSeg:  $('aspect-seg'),
    autoMarginRow: $('automargin-row'),
    autoMargin:    $('automargin'),
    autoMarginNum: $('automargin-num'),
    cardRadius:    $('cardradius'),
    cardRadiusNum: $('cardradius-num'),
    cardWidth:     $('cardwidth'),
    cardWidthNum:  $('cardwidth-num'),
    cardScale:     $('cardscale'),
    cardScaleNum:  $('cardscale-num'),
    advancedToggle: $('advanced-toggle'),
    advancedPanel:  $('advanced-panel'),
    customPosition: $('customPosition'),
    positionCtrls:  $('position-controls'),
    posX:      $('posx'),
    posXLbl:   $('posx-label'),
    posY:      $('posy'),
    posYLbl:   $('posy-label'),
    posReset:  $('pos-reset'),
    shadow:       $('shadow'),
    shadowStyle:  $('shadow-style'),
    watermark:    $('watermark'),
    showTimestamp:     $('showTimestamp'),
    showCounts:        $('showCounts'),
    showVerified:      $('showVerified'),
    showSocialContext: $('showSocialContext'),
    redact:            $('redact'),
    captureSeg:   $('capture-seg'),
    presetSelect: $('preset-select'),
    presetsList:  $('presets-list'),
    presetsEmpty: $('presets-empty'),
    savePreset:   $('save-preset'),
    deletePreset: $('delete-preset'),
    exportScale:  $('export-scale'),
    saveBtn:      $('save'),
    resetBtn:     $('reset-defaults'),
    savedNote:    $('saved-note'),
    testBtn:      $('test-render'),
    testBtnLabel: $('test-render-label'),
    replayTourBtn: $('replay-tour'),
    uiThemeToggle: $('ui-theme-toggle'),
  };

  const state = {
    settings: { ...DEFAULT_SETTINGS },
    presets: [],
    isSetup: false,
    editData: null,
    bgKind: 'flat',      // UI-only filter for the swatch grid
    lastShadow: 'soft',  // remembered style while the shadow toggle is off
  };

  function escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  const PLUS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';

  function currentPreset() {
    return BACKGROUND_PRESETS.find(p => p.id === state.settings.backgroundId) || null;
  }
  function presetIsActive(p) {
    return !state.settings.customBg && !state.settings.customColor && p.id === state.settings.backgroundId;
  }

  // ---------- Renderers ----------

  function renderTheme() {
    el.themeSeg.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === state.settings.theme);
    });
  }

  function renderBgKind() {
    el.bgKindSeg.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.kind === state.bgKind);
    });
  }

  function renderBgGrid() {
    const shown = BACKGROUND_PRESETS.filter(p => (p.kind || 'flat') === state.bgKind);
    const swatches = shown.map(p => `
      <button type="button"
              class="bg-swatch ${p.id === 'none' ? 'is-none' : ''} ${presetIsActive(p) ? 'active' : ''}"
              data-bg-id="${p.id}" title="${escHtml(p.name)}" aria-label="${escHtml(p.name)}"
              style="${p.id === 'none' ? '' : `background:${p.css};`}">
        <span class="bg-check">${CHECK_SVG}</span>
      </button>`).join('');
    const addActive = !!state.settings.customBg;
    el.bgGrid.innerHTML = swatches + `
      <span class="bg-sep" aria-hidden="true"></span>
      <button type="button" class="bg-add ${addActive ? 'active' : ''}" id="bg-add" title="Upload custom image" aria-label="Upload custom image">${PLUS_SVG}</button>`;
  }

  function renderUploadFilename() {
    const hasCustom = !!state.settings.customBg;
    el.uploadFilename.classList.toggle('visible', hasCustom);
    if (hasCustom) el.uploadFilename.querySelector('.name').textContent = state.settings.customBgName || 'Custom image';
  }

  function renderCustomColor() {
    const active = !!state.settings.customColor;
    el.customColorField.classList.toggle('active', active);
    const preset = currentPreset();
    const fallback = preset && /^#[0-9a-f]{6}$/i.test(preset.css) ? preset.css : '#2855FF';
    const hex = (state.settings.customColor || fallback).toUpperCase();
    el.customColor.value = hex;
    el.customHex.value = active ? hex : '';
    el.customHex.placeholder = hex;
  }

  function renderAspectSeg() {
    el.aspectSeg.innerHTML = ASPECT_RATIOS.map(a => `
      <button type="button" data-aspect-id="${a.id}" class="${state.settings.aspectId === a.id ? 'active' : ''}">${escHtml(a.name)}</button>
    `).join('');
    el.autoMarginRow.style.display = state.settings.aspectId === 'auto' ? '' : 'none';
  }

  function setRange(range, num, value) {
    range.value = String(value);
    if (num) num.value = String(value);
    const min = Number(range.min), max = Number(range.max);
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    range.style.setProperty('--fill', `${pct}%`);
  }

  function renderRanges() {
    const s = state.settings;
    setRange(el.autoMargin, el.autoMarginNum, s.autoMargin ?? 40);
    setRange(el.cardRadius, el.cardRadiusNum, s.cardRadius ?? 6);
    setRange(el.cardWidth, el.cardWidthNum, s.cardWidth ?? 560);
    setRange(el.cardScale, el.cardScaleNum, s.cardScale ?? 100);
  }

  function renderPosition() {
    const on = !!state.settings.customPosition;
    el.customPosition.checked = on;
    el.positionCtrls.style.display = on ? 'block' : 'none';
    setRange(el.posX, null, state.settings.posX ?? 0);
    setRange(el.posY, null, state.settings.posY ?? 0);
    el.posXLbl.textContent = `X offset (${state.settings.posX ?? 0}px)`;
    el.posYLbl.textContent = `Y offset (${state.settings.posY ?? 0}px)`;
  }

  function renderToggles() {
    const s = state.settings;
    el.showTimestamp.checked = s.showTimestamp;
    el.showCounts.checked = !!s.showCounts;
    el.showVerified.checked = !!s.showVerified;
    el.showSocialContext.checked = s.showSocialContext !== false;
    el.redact.checked = s.redact;
    const shadow = s.shadow || 'none';
    el.shadow.checked = shadow !== 'none';
    if (shadow !== 'none') state.lastShadow = shadow;
    el.shadowStyle.value = state.lastShadow;
    el.shadowStyle.disabled = shadow === 'none';
    el.watermark.checked = s.watermark !== false;
  }

  function renderCaptureAction() {
    el.captureSeg.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.capture === (state.settings.captureAction || 'download'));
    });
  }

  function renderExport() {
    el.exportScale.value = String(state.settings.exportScale ?? 2);
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
            <button type="button" data-action="load" data-idx="${i}">Load</button>
            <button type="button" data-action="delete" data-idx="${i}">Delete</button>
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

  function renderCaption() {
    const s = state.settings;
    const aspect = ASPECT_RATIOS.find(a => a.id === s.aspectId) || ASPECT_RATIOS[0];
    el.previewCaption.textContent = aspect.id === 'auto'
      ? `${s.cardWidth} px capture width · ${s.autoMargin} px padding`
      : `${aspect.width} × ${aspect.height} px canvas · ${s.cardScale}% post size`;
  }

  // Preview sizing: fill the viewport width (the height follows), capped only
  // so tall canvases like 9:16 don't run off the page. Preview only — exports
  // render at native size.
  const PREVIEW_MAX_H = 640;
  function autoFit() {
    const wrap = el.viewport;
    const stage = el.stage;
    const availW = wrap.clientWidth;
    const w = stage.offsetWidth;
    const h = stage.offsetHeight;
    if (!w || !h) return;
    const scale = Math.min(availW / w, PREVIEW_MAX_H / h);
    stage.style.transform = `scale(${scale})`;
    stage.style.transformOrigin = 'top left';
    el.scale.style.width = `${w * scale}px`;
    el.scale.style.height = `${h * scale}px`;
  }

  function renderPreview() {
    const previewData = state.editData || SAMPLE_DATA;
    el.card.innerHTML = renderCard(previewData, state.settings);
    applyStage(el.stage, el.card, state.settings);
    renderCaption();
    requestAnimationFrame(autoFit);
  }

  function renderControls() {
    renderTheme();
    renderBgKind();
    renderBgGrid();
    renderUploadFilename();
    renderCustomColor();
    renderAspectSeg();
    renderRanges();
    renderPosition();
    renderToggles();
    renderCaptureAction();
    renderExport();
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

  // ---------- Events ----------

  el.tabNav.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    const target = btn.dataset.tab;
    el.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === target));
    el.tabPanels.forEach(p => p.classList.toggle('active', p.dataset.tabPanel === target));
  });

  document.querySelectorAll('.section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = btn.closest('.collapsible');
      const open = sec.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  el.themeSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-theme]');
    if (btn) update({ theme: btn.dataset.theme });
  });

  el.bgKindSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-kind]');
    if (!btn) return;
    state.bgKind = btn.dataset.kind;
    renderBgKind();
    renderBgGrid();
  });

  el.bgGrid.addEventListener('click', (e) => {
    if (e.target.closest('#bg-add')) { el.customBg.click(); return; }
    const b = e.target.closest('button[data-bg-id]');
    if (b) update({ backgroundId: b.dataset.bgId, customBg: null, customBgName: null, customColor: null });
  });

  el.customBg.addEventListener('change', () => {
    const f = el.customBg.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => update({ customBg: r.result, customBgName: f.name, customColor: null });
    r.readAsDataURL(f);
  });

  el.uploadClear.addEventListener('click', () => {
    el.customBg.value = '';
    update({ customBg: null, customBgName: null, backgroundId: state.settings.backgroundId || 'cobalt' });
  });

  function applyHex(raw) {
    let v = String(raw || '').trim();
    if (v && !v.startsWith('#')) v = '#' + v;
    if (!/^#[0-9a-f]{6}$/i.test(v)) return false;
    update({ customColor: v.toUpperCase(), customBg: null, customBgName: null });
    return true;
  }
  el.customColor.addEventListener('input', () => applyHex(el.customColor.value));
  el.customHex.addEventListener('change', () => { if (!applyHex(el.customHex.value)) renderCustomColor(); });
  el.customHex.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); el.customHex.blur(); } });

  el.aspectSeg.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-aspect-id]');
    if (!b) return;
    const a = ASPECT_RATIOS.find(x => x.id === b.dataset.aspectId);
    update({
      aspectId: b.dataset.aspectId,
      cardScale: a?.defaultScale ?? 100,
      cardWidth: a?.defaultWidth ?? 480,
      cardRadius: a?.defaultRadius ?? 6,
    });
  });

  // Slider <-> number input pairs
  function bindRange(range, num, key) {
    const commit = (raw) => {
      const min = Number(range.min), max = Number(range.max);
      let v = parseInt(raw, 10);
      if (Number.isNaN(v)) v = state.settings[key];
      v = Math.min(max, Math.max(min, v));
      update({ [key]: v }, { renderAll: false });
      setRange(range, num, v);
    };
    range.addEventListener('input', () => commit(range.value));
    if (num) num.addEventListener('change', () => commit(num.value));
  }
  bindRange(el.autoMargin, el.autoMarginNum, 'autoMargin');
  bindRange(el.cardRadius, el.cardRadiusNum, 'cardRadius');
  bindRange(el.cardWidth, el.cardWidthNum, 'cardWidth');
  bindRange(el.cardScale, el.cardScaleNum, 'cardScale');

  el.advancedToggle.addEventListener('click', () => {
    const open = el.advancedToggle.classList.toggle('open');
    el.advancedPanel.style.display = open ? 'block' : 'none';
  });

  el.customPosition.addEventListener('change', () => update({ customPosition: el.customPosition.checked }));
  el.posX.addEventListener('input', () => {
    update({ posX: parseInt(el.posX.value, 10) }, { renderAll: false });
    setRange(el.posX, null, state.settings.posX);
    el.posXLbl.textContent = `X offset (${state.settings.posX}px)`;
  });
  el.posY.addEventListener('input', () => {
    update({ posY: parseInt(el.posY.value, 10) }, { renderAll: false });
    setRange(el.posY, null, state.settings.posY);
    el.posYLbl.textContent = `Y offset (${state.settings.posY}px)`;
  });
  el.posReset.addEventListener('click', () => update({ posX: 0, posY: 0 }));

  el.shadow.addEventListener('change', () => {
    update({ shadow: el.shadow.checked ? state.lastShadow : 'none' }, { renderAll: false });
    renderToggles();
  });
  el.shadowStyle.addEventListener('change', () => {
    state.lastShadow = el.shadowStyle.value;
    update({ shadow: el.shadowStyle.value }, { renderAll: false });
    renderToggles();
  });
  el.watermark.addEventListener('change', () => update({ watermark: el.watermark.checked }, { renderAll: false }));

  ['showTimestamp', 'showCounts', 'showVerified', 'showSocialContext', 'redact'].forEach(key => {
    el[key].addEventListener('change', () => update({ [key]: el[key].checked }, { renderAll: false }));
  });

  el.captureSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-capture]');
    if (!btn) return;
    update({ captureAction: btn.dataset.capture }, { renderAll: false });
    renderCaptureAction();
  });

  el.exportScale.addEventListener('change', () => {
    update({ exportScale: parseInt(el.exportScale.value, 10) || 2 }, { renderAll: false });
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
    flashSaved('Saved');
  });

  el.resetBtn.addEventListener('click', () => {
    if (!confirm('Reset every setting to its default?')) return;
    update({ ...DEFAULT_SETTINGS });
    flashSaved('Defaults restored');
  });

  el.testBtn.addEventListener('click', async () => {
    el.testBtn.disabled = true;
    // Render an unscaled copy of the stage. The off-screen positioning goes on
    // a wrapper, not the stage itself: html-to-image copies the target node's
    // computed styles into its SVG, so a `position: fixed; left: -10000px`
    // stage would be drawn 10,000px outside the canvas (a blank PNG).
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed; left:-10000px; top:0; pointer-events:none; z-index:-1;';
    const clone = el.stage.cloneNode(true);
    clone.style.transform = '';
    clone.style.transformOrigin = '';
    host.appendChild(clone);
    document.body.appendChild(host);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      const meta = isEditMode && state.editData
        ? { handle: state.editData.handle, tweetId: state.editData.tweetId }
        : { handle: 'sample', tweetId: 'preview' };
      meta.pixelRatio = state.settings.exportScale ?? 2;
      await window.pixelSnitchRender.downloadFromNode(clone, meta);
      if (isEditMode) {
        await new Promise(r => chrome.storage.local.remove('pendingCapture', r));
        window.close();
      } else {
        flashSaved('Sample downloaded');
      }
    } catch (err) {
      console.error('[pixelsnitch] test render failed', err);
      flashSaved('Export failed');
    } finally {
      host.remove();
      el.testBtn.disabled = false;
    }
  });

  el.replayTourBtn.addEventListener('click', () => window.pixelSnitchTour?.start());

  el.uiThemeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-ui-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-ui-theme', next);
    try { localStorage.setItem('pixelsnitch-ui-theme', next); } catch {}
  });

  window.addEventListener('resize', autoFit);

  // ---------- Init ----------
  async function init() {
    const stored = await new Promise(r =>
      chrome.storage.local.get(['lastSettings', 'presets', 'isSetup', 'pendingCapture'], r)
    );
    state.settings = { ...DEFAULT_SETTINGS, ...(stored.lastSettings || {}) };
    state.presets = stored.presets || [];
    state.isSetup = !!stored.isSetup;
    state.bgKind = currentPreset()?.kind || 'flat';
    if (state.settings.shadow && state.settings.shadow !== 'none') state.lastShadow = state.settings.shadow;

    if (isEditMode) {
      state.editData = stored.pendingCapture?.data || null;
      el.testBtnLabel.textContent = 'Export PNG';
      el.saveBtn.style.display = 'none';
      el.resetBtn.style.display = 'none';
    } else if (isFirstRun && !state.isSetup) {
      el.firstrun.style.display = 'flex';
    }

    renderStatus();
    renderControls();
    renderPreview();

    if (window.pixelSnitchTour) {
      const auto = await window.pixelSnitchTour.shouldAutoStart({ isFirstRun, isEditMode });
      if (auto) window.pixelSnitchTour.start();
    }
  }

  init();
})();
