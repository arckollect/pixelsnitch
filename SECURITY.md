# Security Policy

Thanks for helping keep PixelSnitch and its users safe.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, pull requests, or discussions.**

If you believe you've found a security issue in PixelSnitch, please report it privately by opening a **GitHub Security Advisory**:

<https://github.com/Arckollect/pixelsnitch/security/advisories/new>

This is the only supported private reporting channel — it keeps the details confidential until a fix is ready and creates a proper record for attribution and disclosure. You will need a free GitHub account to submit one.

When reporting, please include:

- A clear description of the issue
- Steps to reproduce (a minimal proof of concept is ideal)
- The impact — what can an attacker do?
- The version of PixelSnitch affected (check `manifest.json`)
- Your Chrome version and OS

You should receive an initial response within **7 days**. If you don't hear back, please follow up — messages occasionally get lost.

## What's in scope

- Cross-site scripting (XSS) in the extension's UI or injected content
- Ways the extension could leak browsing data, post content, or user settings to third parties
- Permission escalation or abuse of the extension's Chrome permissions (`storage`, `clipboardWrite`, host permissions on `pbs.twimg.com` / `video.twimg.com` / `abs.twimg.com`)
- Ways a malicious page could manipulate the extension into unintended behavior
- Vulnerabilities in the specific versions of bundled libraries (see `vendor/` and `THIRD_PARTY_LICENSES`)

## What's not in scope

- Issues in Chrome, X.com, or other services — report those to their respective vendors
- Social engineering attacks against users
- Bugs that require physical access to an already-unlocked device
- Issues that require the user to install an unrelated malicious extension
- Rate-limiting or abuse-prevention features of X — PixelSnitch is not a scraping tool and does not attempt to bypass them

## Our commitment

- We will acknowledge receipt of your report promptly
- We will keep you informed as we investigate and remediate
- We will credit you in the release notes and security advisory once a fix ships (unless you prefer to remain anonymous)
- We will not take legal action against researchers who report vulnerabilities in good faith and follow this policy

## Disclosure

Once a fix is released, we will publish a security advisory describing the issue, the fix, and any workarounds. We ask that reporters coordinate public disclosure with us so users have time to update.

Thank you for helping keep PixelSnitch secure.
