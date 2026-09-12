(() => {
  function safeName(handle, tweetId) {
    const h = (handle ?? 'x').replace(/^@/, '').replace(/[^a-zA-Z0-9_-]/g, '');
    const id = tweetId ?? Date.now();
    return `pixelsnitch-${h || 'x'}-${id}.png`;
  }

  async function renderNodeToBlob(node, opts = {}) {
    const pixelRatio = opts.pixelRatio ?? 2;
    return await window.htmlToImage.toBlob(node, {
      pixelRatio,
      cacheBust: true,
      skipFonts: false,
      backgroundColor: opts.backgroundColor,
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function copyBlobToClipboard(blob) {
    if (!navigator.clipboard?.write) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  }

  async function downloadFromNode(node, meta = {}) {
    const blob = await renderNodeToBlob(node, { pixelRatio: meta.pixelRatio });
    downloadBlob(blob, safeName(meta.handle, meta.tweetId));
    return blob;
  }

  async function copyFromNode(node, opts = {}) {
    const blob = await renderNodeToBlob(node, { pixelRatio: opts.pixelRatio });
    await copyBlobToClipboard(blob);
    return blob;
  }

  window.pixelSnitchRender = {
    renderNodeToBlob,
    downloadBlob,
    copyBlobToClipboard,
    downloadFromNode,
    copyFromNode,
    safeName,
  };
})();
