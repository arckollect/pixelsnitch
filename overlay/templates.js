(() => {
  const BACKGROUND_PRESETS = [
    { id: 'none',      name: 'None',           css: 'transparent' },
    { id: 'white',     name: 'White',          css: '#ffffff' },
    { id: 'black',     name: 'Black',          css: '#000000' },
    { id: 'twilight',  name: 'Twilight',       css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'sunset',    name: 'Sunset',         css: 'linear-gradient(135deg, #ff6a88 0%, #ff99ac 50%, #ffcf71 100%)' },
    { id: 'ocean',     name: 'Ocean',          css: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)' },
    { id: 'lime',      name: 'Lime',           css: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
    { id: 'mesh-rose', name: 'Rose Mesh',      css: 'radial-gradient(at 20% 30%, #ff9a9e 0px, transparent 50%), radial-gradient(at 80% 0%, #fad0c4 0px, transparent 50%), radial-gradient(at 0% 100%, #fbc2eb 0px, transparent 50%), radial-gradient(at 100% 100%, #a18cd1 0px, transparent 50%), #ffdde1' },
    { id: 'mesh-cool', name: 'Cool Mesh',      css: 'radial-gradient(at 20% 30%, #84fab0 0px, transparent 50%), radial-gradient(at 80% 0%, #8fd3f4 0px, transparent 50%), radial-gradient(at 0% 100%, #cfd9df 0px, transparent 50%), radial-gradient(at 100% 100%, #a1c4fd 0px, transparent 50%), #c2e9fb' },
  ];

  const ASPECT_RATIOS = [
    { id: 'auto',   name: 'Auto',       width: null, height: null, defaultScale: 100, defaultWidth: 560 },
    { id: 'square', name: 'Square 1:1', width: 1080, height: 1080, defaultScale: 140, defaultWidth: 620 },
    { id: 'wide',   name: 'Wide 16:9',  width: 1600, height: 900,  defaultScale: 230, defaultWidth: 510 },
    { id: 'story',  name: 'Story 9:16', width: 1080, height: 1920, defaultScale: 150, defaultWidth: 600 },
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

  window.xstampedTemplates = { BACKGROUND_PRESETS, ASPECT_RATIOS, THEMES };
})();
