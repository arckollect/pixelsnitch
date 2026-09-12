(function () {
  // Runs before the stylesheet so the page never flashes the wrong theme.
  // Default is light; the toggle persists the user's choice in localStorage.
  var t = 'light';
  try {
    var saved = localStorage.getItem('pixelsnitch-ui-theme');
    if (saved === 'light' || saved === 'dark') t = saved;
  } catch (e) {}
  document.documentElement.setAttribute('data-ui-theme', t);
})();
