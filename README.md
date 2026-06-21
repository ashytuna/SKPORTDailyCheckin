# SKPORT Daily Check-in

A minimal Chromium extension that automatically claims the **Arknights: Endfield**
daily check-in on [SKPORT](https://game.skport.com/endfield/sign-in).

Unlike a HoYoLAB-style check-in (which rides on cookies the browser attaches
automatically), SKPORT signs each request: a long-lived `cred` is exchanged for a
short-lived signing token, and every call carries a per-request `sign`. The
extension does this entirely in the background — no tab is opened.

## How it works

- `background.js` triggers a claim on browser startup and via a 6-hour alarm,
  skipping if today is already done.
- `skport.js` reads `cred` from the `skport.com` cookie, calls
  `/web/v1/auth/refresh` to get a fresh signing token, resolves the game role from
  `/api/v1/game/player/binding`, computes
  `sign = md5(hmac_sha256_hex(path + body + ts + headerJson, token))`, and POSTs to
  `/web/v1/game/endfield/attendance`.
- `md5.js` is the MD5 used by the signature (Web Crypto has no MD5).
- The toolbar badge shows `✓` after a successful claim, `✗` on failure.

## Setup

1. **Sign in** to <https://game.skport.com/endfield/sign-in> in this browser.
2. Go to `chrome://extensions/`, enable **Developer Mode**.
3. **Load unpacked** → choose this folder.

After that just open the browser at least once a day; the check-in runs on its own.

## Multiple accounts

Each Chrome **profile** stores one logged-in account. Install (load unpacked) the
extension in each profile; it automatically uses that profile's account.

## Notes

- The signing token is refreshed from `cred` on every run, so an expired token is
  not a problem. If `cred` itself expires, sign in to SKPORT again.
- No CAPTCHA handling. If SKPORT ever gates check-in behind a CAPTCHA, claim
  manually that day.
