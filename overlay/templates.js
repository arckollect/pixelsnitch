(() => {
  // Brand backgrounds carry a wordmark watermark; `watermark` is the wordmark color.
  const BACKGROUND_PRESETS = [
    { id: 'cobalt',    name: 'Cobalt',         css: '#2855FF', watermark: 'white', kind: 'flat' },
    { id: 'lime',      name: 'Lime',           css: '#DFFF70', watermark: 'black', kind: 'flat' },
    { id: 'none',      name: 'None',           css: 'transparent', kind: 'transparent' },
    { id: 'white',     name: 'White',          css: '#ffffff', kind: 'flat' },
    { id: 'black',     name: 'Black',          css: '#000000', kind: 'flat' },
    { id: 'twilight',  name: 'Twilight',       css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', kind: 'gradient' },
    { id: 'sunset',    name: 'Sunset',         css: 'linear-gradient(135deg, #ff6a88 0%, #ff99ac 50%, #ffcf71 100%)', kind: 'gradient' },
    { id: 'ocean',     name: 'Ocean',          css: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)', kind: 'gradient' },
    { id: 'mint',      name: 'Mint',           css: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', kind: 'gradient' },
    { id: 'mesh-rose', name: 'Rose Mesh',      css: 'radial-gradient(at 20% 30%, #ff9a9e 0px, transparent 50%), radial-gradient(at 80% 0%, #fad0c4 0px, transparent 50%), radial-gradient(at 0% 100%, #fbc2eb 0px, transparent 50%), radial-gradient(at 100% 100%, #a18cd1 0px, transparent 50%), #ffdde1', kind: 'gradient' },
    { id: 'mesh-cool', name: 'Cool Mesh',      css: 'radial-gradient(at 20% 30%, #84fab0 0px, transparent 50%), radial-gradient(at 80% 0%, #8fd3f4 0px, transparent 50%), radial-gradient(at 0% 100%, #cfd9df 0px, transparent 50%), radial-gradient(at 100% 100%, #a1c4fd 0px, transparent 50%), #c2e9fb', kind: 'gradient' },
    { id: 'sky',       name: 'Sky',            css: 'radial-gradient(ellipse at center, #ffffff 0%, #d8ecf7 55%, #a8d0e8 100%)', kind: 'gradient' },
  ];

  const ASPECT_RATIOS = [
    // Per-aspect starting values, applied when the aspect is picked.
    { id: 'auto',   name: 'Auto',       width: null, height: null, defaultScale: 100, defaultWidth: 480, defaultRadius: 6 },
    { id: 'square', name: 'Square 1:1', width: 1080, height: 1080, defaultScale: 190, defaultWidth: 470, defaultRadius: 6 },
    { id: 'wide',   name: 'Wide 16:9',  width: 1600, height: 900,  defaultScale: 255, defaultWidth: 510, defaultRadius: 6 },
    { id: 'story',  name: 'Story 9:16', width: 1080, height: 1920, defaultScale: 210, defaultWidth: 450, defaultRadius: 6 },
  ];

  const THEMES = {
    dark: {
      cardBg:   '#000000',
      cardText: '#e7e9ea',
      cardMeta: '#71767b',
      cardBorder: '#2f3336',
      accent:   '#1d9bf0',
      quoteBorder: '#2f3336',
      quoteBg: 'transparent',
    },
    light: {
      cardBg:   '#ffffff',
      cardText: '#0f1419',
      cardMeta: '#536471',
      cardBorder: '#eff3f4',
      accent:   '#1d9bf0',
      quoteBorder: '#eff3f4',
      quoteBg: '#ffffff',
    },
  };

  window.pixelSnitchTemplates = { BACKGROUND_PRESETS, ASPECT_RATIOS, THEMES };
})();
