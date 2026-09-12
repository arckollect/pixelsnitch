# Privacy Policy — PixelSnitch

_Last updated: September 11, 2026_

PixelSnitch is a Chrome extension that turns posts on x.com into PNG images. It runs entirely inside your browser.

## What the extension accesses

- **Post content on x.com / twitter.com.** When you click the capture button on a post, the extension reads that post's visible content — text, display name, handle, avatar, attached images or video poster, timestamp, and reply/repost/like counts — in order to draw it into an image. It reads only the post you clicked, only at the moment you click.
- **Images from `pbs.twimg.com`, `video.twimg.com`, and `abs.twimg.com`.** Avatars and media are fetched so they can be embedded in the generated PNG.
- **Clipboard (write only).** If you choose "Copy to clipboard", the generated PNG is written to your clipboard. The extension never reads your clipboard.

## What is stored

Your style settings (background, layout, export options) and any presets you save are stored locally in Chrome's extension storage on your device. Nothing else is stored.

## What is transmitted

Nothing. The extension has no server, makes no analytics or telemetry requests, and sends no data — post content, settings, or otherwise — to the developer or any third party. The only network requests it makes are the image fetches from the `twimg.com` domains listed above, which are needed to render the capture.

## Data sharing and sale

No user data is collected by the developer, so none is shared, sold, or transferred.

## Changes

If this policy changes, the updated version will be published at this URL and the "Last updated" date revised.

## Contact

Questions: open an issue at https://github.com/arckollect/pixelsnitch/issues
