'use strict';

// SKPORT API client for the Arknights: Endfield daily check-in.
// Auth model: a long-lived `cred` (read from the skport.com cookie) is exchanged
// for a short-lived signing token, and every request carries a per-request
// signature: sign = md5(hmac_sha256_hex(path + body + ts + headerJson, token)).

import { md5 } from './md5.js';

const ZONAI = "https://zonai.skport.com";
const PLATFORM = "3";
const VNAME = "1.0.0";
const SK_LANG = "en_US";

const CRED_COOKIE = "SK_OAUTH_CRED_KEY";
const ATTENDANCE_PATH = "/web/v1/game/endfield/attendance";
const BINDING_PATH = "/api/v1/game/player/binding";
const REFRESH_PATH = "/web/v1/auth/refresh";

const CODE_OK = 0;
const CODE_ALREADY_CLAIMED = 10001;

async function hmacSha256Hex(keyStr, msgStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(keyStr), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msgStr));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function makeSign(token, path, body, ts) {
  const headerJson = `{"platform":"${PLATFORM}","timestamp":"${ts}","dId":"","vName":"${VNAME}"}`;
  return md5(await hmacSha256Hex(token, path + body + ts + headerJson));
}

function nowTs() { return String(Math.floor(Date.now() / 1000)); }

function baseHeaders() {
  return { "accept": "*/*", "content-type": "application/json", "platform": PLATFORM, "vname": VNAME, "sk-language": SK_LANG };
}

async function signedFetch(method, path, cred, token, role) {
  const ts = nowTs();
  const sign = await makeSign(token, path, "", ts);
  const headers = { ...baseHeaders(), cred, timestamp: ts, sign };
  if (role) headers["sk-game-role"] = role;
  const res = await fetch(ZONAI + path, { method, headers, body: method === "POST" ? "" : undefined });
  try { return await res.json(); }
  catch (e) { return { code: -1 }; }
}

async function getCred() {
  const all = await chrome.cookies.getAll({ name: CRED_COOKIE });
  const hit = all.find((c) => c.domain.includes("skport.com"));
  return hit ? hit.value : null;
}

async function getToken(cred) {
  const res = await fetch(ZONAI + REFRESH_PATH, { headers: { ...baseHeaders(), cred } });
  const d = await res.json().catch(() => ({}));
  return d?.code === CODE_OK ? d?.data?.token : null;
}

function extractRole(bindingData) {
  const apps = bindingData?.data?.list || [];
  for (const app of apps) {
    if (app.appCode && app.appCode !== "endfield") continue;
    for (const b of app.bindingList || []) {
      const r = b.defaultRole || (b.roles && b.roles[0]);
      if (r && r.roleId) return `${b.gameId}_${r.roleId}_${r.serverId}`;
    }
  }
  return null;
}

// Claims today's Endfield attendance. Resolves true when claimed (or already
// claimed earlier today). Throws with a reason if the flow cannot complete.
export async function claimDaily() {
  const cred = await getCred();
  if (!cred) throw new Error("cred cookie not found (not signed in?)");

  const token = await getToken(cred);
  if (!token) throw new Error("token refresh failed");

  const binding = await signedFetch("GET", BINDING_PATH, cred, token, null);
  if (binding.code !== CODE_OK) throw new Error("binding failed (code " + binding.code + ")");
  const role = extractRole(binding);
  if (!role) throw new Error("no Endfield role found");

  const claim = await signedFetch("POST", ATTENDANCE_PATH, cred, token, role);
  if (claim.code === CODE_OK || claim.code === CODE_ALREADY_CLAIMED) return true;

  // Unknown response: fall back to reading status to decide.
  const after = await signedFetch("GET", ATTENDANCE_PATH, cred, token, role);
  return after?.data?.hasToday === true;
}
