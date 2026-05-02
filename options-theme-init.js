(function () {
  try {
    var t = localStorage.getItem('pixelsnitch-ui-theme');
    if (t !== 'light' && t !== 'dark') {
      t = 'light';
    }
    document.documentElement.setAttribute('data-ui-theme', t);
  } catch (e) {}
})();
