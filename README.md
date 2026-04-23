# PixelSnitch

A Chrome extension that captures X (formerly Twitter) posts as clean, customizable PNG images — straight from your timeline, with one click.

> **Status:** v0.2.0 — early but working. Not yet published to the Chrome Web Store; install by loading the unpacked extension (see below).

---

## Features

- Adds a small camera button to every post's action bar on `x.com` / `twitter.com`
- Exports the post as a high-resolution PNG you can share, archive, or paste anywhere
- Configurable capture options via the extension's options page (background, layout, etc.)
- Runs entirely in your browser — no account, no server, no tracking

## Installation (load unpacked)

Until the extension is published to the Chrome Web Store, you install it manually:

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Arckollect/pixelsnitch.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Toggle **Developer mode** on (top-right)
4. Click **Load unpacked** and select the `pixelsnitch` folder
5. Pin the extension from the puzzle-piece menu for easy access

## Usage

1. Open `x.com` (or `twitter.com`)
2. You'll see a small camera icon in each post's action bar, next to the other buttons
3. Click it — a PNG of the post will download to your default Downloads folder
4. Click the PixelSnitch extension icon (or go to `chrome://extensions` → PixelSnitch → **Options**) to customize the capture style

## Project structure

```
pixelsnitch/
├── manifest.json          # Chrome extension manifest (MV3)
├── background.js          # Service worker
├── content.js             # Injects the camera button into X's UI
├── options.html / .js     # Settings page
├── overlay/               # Card rendering, extraction, capture logic
│   ├── templates.js
│   ├── card.js
│   ├── extract.js
│   ├── render.js
│   ├── capture.js
│   └── overlay.css
├── vendor/                # Third-party libraries (html-to-image, Inter font)
└── icons/                 # Extension icons (16/48/128)
```

## Contributing

Contributions are welcome — this is intended to be a community project. Please read **[CONTRIBUTING.md](CONTRIBUTING.md)** for setup, workflow, and code style, and **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** before participating.

Found a bug or have an idea? Open an issue. Want to fix something? Open a pull request.

## Security

If you discover a security vulnerability, please **do not** open a public issue. See **[SECURITY.md](SECURITY.md)** for private disclosure instructions.

## License

PixelSnitch is released under the [MIT License](LICENSE).

Third-party code and assets bundled with this extension are listed in [THIRD_PARTY_LICENSES](THIRD_PARTY_LICENSES).

---

## Disclaimer

PixelSnitch is an independent, unofficial project. It is **not affiliated with, endorsed by, or sponsored by X Corp or Twitter, Inc.** "X" and "Twitter" are trademarks of their respective owners and are used here only to describe the platform this extension interacts with.

Posts captured with this extension are the intellectual property of their original authors. Users of PixelSnitch are **solely responsible** for how they use captured content — including compliance with copyright law, fair use, attribution conventions, and X's Terms of Service.

PixelSnitch is provided **AS-IS, with no warranty** (see [LICENSE](LICENSE)).
