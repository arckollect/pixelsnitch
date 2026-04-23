# Contributing to PixelSnitch

Thanks for your interest in PixelSnitch! Contributions of all kinds are welcome — bug reports, feature ideas, documentation, and code.

## Ground rules

- Be kind. Read the [Code of Conduct](CODE_OF_CONDUCT.md).
- By submitting a contribution, you agree it will be licensed under the project's [MIT License](LICENSE).
- Please don't open pull requests that add telemetry, tracking, ads, remote-code-loading, or anything that compromises user privacy. PixelSnitch is a local-only tool.

## Reporting bugs

1. Check [existing issues](../../issues) first to avoid duplicates.
2. Open a new issue using the **Bug report** template.
3. Include: Chrome version, OS, the post URL (if public), what you expected, and what actually happened. Screenshots help a lot.

## Suggesting features

1. Check [existing issues](../../issues) to see if it's already proposed.
2. Open a new issue using the **Feature request** template.
3. Describe the use case first, then the proposed behavior. "Why" matters more than "how."

## Development setup

PixelSnitch has **no build step** — it's vanilla JavaScript, HTML, and CSS. You do not need Node.js, npm, or any toolchain to work on it.

### Running the extension locally

1. Fork and clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pixelsnitch.git
   cd pixelsnitch
   ```
2. Open Chrome → `chrome://extensions`
3. Toggle **Developer mode** on (top-right)
4. Click **Load unpacked** → select the `pixelsnitch` folder
5. Open `x.com` in a tab to test

### Seeing your changes

- Edits to `content.js`, `overlay/*.js`, `overlay/overlay.css`: reload the X tab.
- Edits to `background.js` or `manifest.json`: click the reload icon on PixelSnitch's card in `chrome://extensions`, then reload the X tab.
- Edits to `options.html` / `options.js`: reopen the options page.

### File map

| File / folder | What it does |
|---|---|
| `manifest.json` | Extension metadata and permissions (MV3) |
| `background.js` | Service worker (message passing, options page opener) |
| `content.js` | Injects the camera button into X's post action bar |
| `overlay/extract.js` | Pulls text, media, author info out of a post's DOM |
| `overlay/templates.js` | Card layout templates |
| `overlay/card.js` | Builds the HTML card from extracted data |
| `overlay/render.js` | Positions the card offscreen for capture |
| `overlay/capture.js` | Converts the card to PNG and triggers download |
| `overlay/overlay.css` | Card styling |
| `options.html` / `options.js` | User settings page |
| `vendor/` | Third-party deps (html-to-image, Inter font) — don't edit |
| `icons/` | 16/48/128 px extension icons |

## Making a pull request

1. Create a branch off `main`:
   ```bash
   git checkout -b fix/short-description
   ```
2. Make your changes. Keep commits focused — one logical change per commit.
3. Test the extension manually on `x.com`. Include at least:
   - Capturing a text-only post
   - Capturing a post with an image
   - Capturing a post in a thread
4. Push to your fork and open a PR against `main`. Fill in the PR template.
5. A maintainer will review. Expect back-and-forth — that's normal.

## Code style

- **Vanilla JS only.** No TypeScript, no frameworks, no bundlers — keep the repo dependency-free.
- Two-space indentation, single quotes, semicolons.
- Use `const` / `let` — never `var`.
- Match the style of the file you're editing.
- Comments should explain *why*, not *what*. Well-named variables and functions carry the "what."
- No `console.log` left in production code. `console.error` for actual errors is fine.

## Things we probably won't merge

- Adding a build step or bundler (goal: stay zero-dependency and auditable)
- Analytics, telemetry, or external API calls that aren't strictly required for a feature
- Features that depend on a specific X account tier or paid API
- Large UI rewrites without a prior discussion issue

If you're unsure whether something will be accepted, open an issue first to discuss the idea.

## Thanks

Seriously, thanks. Small open-source projects live and die by community contributions.
