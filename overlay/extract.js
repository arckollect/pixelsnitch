(() => {
  const warn = (msg, el) => console.warn(`[pixelsnitch] ${msg}`, el ?? '');

  const upgradeImageUrl = (url) => {
    if (!url) return url;
    return url.replace(/&name=\w+$/, '&name=large');
  };

  const upgradeAvatarUrl = (url) => {
    if (!url) return url;
    return url.replace(/_normal\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i, '_400x400.$1$2');
  };

  // Walks a tweetText node and returns its visible text. Avoids three quirks of
  // `.innerText`: it drops <img alt="🚨"> emojis, pulls in aria-hidden "http://"
  // link prefixes, and injects \n at inline-block boundaries.
  function extractTweetText(el) {
    if (!el) return '';
    let out = '';
    const visit = (node) => {
      if (!node) return;
      if (node.nodeType === Node.TEXT_NODE) {
        out += node.nodeValue;
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.getAttribute('aria-hidden') === 'true') return;
      const tag = node.tagName;
      if (tag === 'BR') { out += '\n'; return; }
      if (tag === 'IMG') {
        const alt = node.getAttribute('alt');
        if (alt) out += alt;
        return;
      }
      for (const child of node.childNodes) visit(child);
    };
    visit(el);
    return out;
  }

  async function urlToDataUrl(url) {
    if (!url) return null;
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error);
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      warn(`image prefetch failed for ${url}: ${err.message}`);
      return null;
    }
  }

  function extractUserBlock(root) {
    const userNameEl = root.querySelector(':scope [data-testid="User-Name"]');
    if (!userNameEl) return { displayName: null, handle: null };
    const displayName = userNameEl.innerText?.split('\n')[0] ?? null;
    const handleLink = [...userNameEl.querySelectorAll('a')]
      .find(a => a.innerText.trim().startsWith('@'));
    return {
      displayName,
      handle: handleLink?.innerText.trim() ?? null,
    };
  }

  function extractPoll(root) {
    const options = [...root.querySelectorAll('[role="radio"], [data-testid^="pollChoice"]')];
    if (options.length === 0) return null;
    const items = options.map(opt => {
      const label = opt.innerText?.split('\n')[0]?.trim() ?? '';
      const pctMatch = opt.innerText?.match(/(\d+(?:\.\d+)?)\s*%/);
      return {
        label,
        percent: pctMatch ? parseFloat(pctMatch[1]) : null,
      };
    }).filter(x => x.label);
    if (items.length === 0) return null;
    return { options: items };
  }

  function extractVideoPoster(root) {
    const container = root.querySelector('[data-testid="videoComponent"], [data-testid="videoPlayer"]');
    if (!container) return null;
    const video = container.querySelector('video');
    if (video?.poster) return video.poster;
    const img = container.querySelector('img');
    return img?.src ?? null;
  }

  function findQuoteNode(article) {
    const candidates = [...article.querySelectorAll('[role="link"]')];
    for (const node of candidates) {
      if (node.closest('[data-testid="tweet"]') !== article) continue;
      const innerUser = node.querySelector('[data-testid="User-Name"]');
      const innerText = node.querySelector('[data-testid="tweetText"]');
      if (innerUser && innerText) return node;
    }
    return null;
  }

  function extractQuoteFromNode(node) {
    if (!node) return null;
    const { displayName, handle } = extractUserBlock(node);
    const innerAvatar = node.querySelector('[data-testid="Tweet-User-Avatar"] img')?.src
      ?? node.querySelector('img[src*="profile_images"]')?.src
      ?? null;
    const innerTime = node.querySelector('time')?.getAttribute('datetime') ?? null;
    const innerText = node.querySelector('[data-testid="tweetText"]');
    return {
      displayName,
      handle,
      datetime: innerTime,
      text: extractTweetText(innerText),
      avatar: upgradeAvatarUrl(innerAvatar),
      photos: [...node.querySelectorAll('[data-testid="tweetPhoto"] img')].map(i => upgradeImageUrl(i.src)),
      verified: !!node.querySelector('[data-testid="icon-verified"]'),
    };
  }

  function extractRaw(article) {
    const quoteNode = findQuoteNode(article);
    const quote = extractQuoteFromNode(quoteNode);

    // Scope main-tweet queries to exclude quote subtree.
    const isOuter = (el) => !quoteNode || !quoteNode.contains(el);
    const pick = (sel) => [...article.querySelectorAll(sel)].find(isOuter) ?? null;

    const userNameEl = pick('[data-testid="User-Name"]');
    const handleLink = userNameEl
      ? [...userNameEl.querySelectorAll('a')].find(a => a.innerText.trim().startsWith('@'))
      : null;
    const timeEl = pick('time');
    const tweetTextEl = pick('[data-testid="tweetText"]');
    const avatarEl = pick('[data-testid="Tweet-User-Avatar"] img');
    const permalink = timeEl?.closest('a')?.href ?? null;
    const tweetId = permalink?.match(/status\/(\d+)/)?.[1] ?? null;
    const socialContext = pick('[data-testid="socialContext"]')?.innerText?.trim() ?? null;

    if (!userNameEl) warn('User-Name not found', article);
    if (!tweetTextEl && !article.querySelector('[data-testid="tweetPhoto"]')) {
      warn('tweetText not found and no photos', article);
    }

    const counts = {};
    for (const k of ['reply', 'retweet', 'like']) {
      const el = [...article.querySelectorAll(`[data-testid="${k}"]`)].find(isOuter);
      counts[k] = el?.innerText?.trim() || '0';
    }

    const photos = [...article.querySelectorAll('[data-testid="tweetPhoto"] img')]
      .filter(isOuter)
      .map(i => upgradeImageUrl(i.src));

    return {
      tweetId,
      permalink,
      displayName: userNameEl?.innerText.split('\n')[0] ?? null,
      handle: handleLink?.innerText.trim() ?? null,
      datetime: timeEl?.getAttribute('datetime') ?? null,
      text: extractTweetText(tweetTextEl),
      avatar: upgradeAvatarUrl(avatarEl?.src ?? null),
      photos,
      verified: !!article.querySelector('[data-testid="icon-verified"]'),
      counts,
      videoPoster: extractVideoPoster(article),
      poll: extractPoll(article),
      socialContext,
      quote,
    };
  }

  async function inlineImages(data) {
    const tasks = [];
    if (data.avatar) tasks.push(urlToDataUrl(data.avatar).then(d => { data.avatar = d ?? data.avatar; }));
    if (data.videoPoster) tasks.push(urlToDataUrl(data.videoPoster).then(d => { data.videoPoster = d ?? data.videoPoster; }));
    data.photos = data.photos || [];
    const photoTasks = data.photos.map((url, idx) =>
      urlToDataUrl(url).then(d => { if (d) data.photos[idx] = d; })
    );
    tasks.push(...photoTasks);
    if (data.quote) {
      if (data.quote.avatar) tasks.push(urlToDataUrl(data.quote.avatar).then(d => { data.quote.avatar = d ?? data.quote.avatar; }));
      data.quote.photos = data.quote.photos || [];
      tasks.push(...data.quote.photos.map((url, idx) =>
        urlToDataUrl(url).then(d => { if (d) data.quote.photos[idx] = d; })
      ));
    }
    await Promise.all(tasks);
    return data;
  }

  async function extractPost(article) {
    const raw = extractRaw(article);
    await inlineImages(raw);
    return raw;
  }

  window.pixelSnitchExtract = { extractPost };
})();
