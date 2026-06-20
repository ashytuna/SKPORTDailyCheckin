# SKPORT Daily Check-in

A minimal Chromium extension that automatically claims the **Arknights: Endfield**
daily check-in on [SKPORT](https://game.skport.com/endfield/sign-in).

Unlike a HoYoLAB-style check-in (which rides on cookies), SKPORT authenticates each
request with custom headers: a `cred` token plus a per-request `sign` derived from a
short-lived signing token. This extension reads `cred` + token from the page's
`localStorage`, regenerates a fresh `sign` on every run, and POSTs the check-in.

## How it works

- `background.js` opens a hidden `game.skport.com` tab once per day (on browser
  startup and via a 6-hour alarm). It skips opening if today is already done.
- `content.js` runs on that page, waits for the site to refresh its cached token,
  reads `cred` (`SK_OAUTH_CRED_KEY`) and the signing token (`SK_TOKEN_CACHE_KEY`)
  from `localStorage`, fetches the game role from `/api/v1/game/player/binding`,
  computes `sign = md5(hmac_sha256_hex(path + ts + headerJson, token))`, and POSTs
  to `/web/v1/game/endfield/attendance`.
- On success the auto-opened tab closes and the toolbar badge shows `✓`.

## Setup

1. **Sign in** to <https://game.skport.com/endfield/sign-in> in this browser.
2. Go to `chrome://extensions/`, enable **Developer Mode**.
3. **Load unpacked** → choose this folder.

The toolbar badge shows `✓` after a successful claim, `✗` on failure.

## Two accounts

Each Chrome **profile** stores one logged-in account. Install (load unpacked) the
extension in each profile; it automatically uses that profile's account. Just open
each browser/profile at least once a day.

## Notes

- The signing token can expire. The extension reads the cached token after letting
  the page bootstrap; if it is stale the run fails cleanly (no success recorded) and
  retries on the next browser open. Re-opening the real site refreshes the token.
- No CAPTCHA handling. If SKPORT ever gates check-in behind a CAPTCHA, claim
  manually that day.
