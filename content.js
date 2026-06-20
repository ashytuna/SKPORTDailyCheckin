'use strict';

const ZONAI = "https://zonai.skport.com";
const PLATFORM = "3";
const VNAME = "1.0.0";
const SK_LANG = "vi_VN";

const CRED_KEY = "SK_OAUTH_CRED_KEY";
const TOKEN_KEY = "SK_TOKEN_CACHE_KEY";

const ATTENDANCE_PATH = "/web/v1/game/endfield/attendance";
const BINDING_PATH = "/api/v1/game/player/binding";

const INITIAL_DELAY = 3000;
const CREDS_TIMEOUT = 15000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function md5(string) {
  function rl(x, c) { return (x << c) | (x >>> (32 - c)); }
  function au(x, y) {
    var x4 = (x & 0x40000000), y4 = (y & 0x40000000), x8 = (x & 0x80000000), y8 = (y & 0x80000000);
    var r = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
    if (x4 & y4) return r ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) { if (r & 0x40000000) return r ^ 0xC0000000 ^ x8 ^ y8; else return r ^ 0x40000000 ^ x8 ^ y8; }
    return r ^ x8 ^ y8;
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | (~z)); }
  function FF(a, b, c, d, x, s, ac) { a = au(a, au(au(F(b, c, d), x), ac)); return au(rl(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = au(a, au(au(G(b, c, d), x), ac)); return au(rl(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = au(a, au(au(H(b, c, d), x), ac)); return au(rl(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = au(a, au(au(I(b, c, d), x), ac)); return au(rl(a, s), b); }
  function cwa(str) {
    var lwc, lml = str.length;
    var t1 = lml + 8; var t2 = (t1 - (t1 % 64)) / 64; var lnw = (t2 + 1) * 16;
    var lwa = Array(lnw - 1); var lbp = 0, lbc = 0;
    while (lbc < lml) { lwc = (lbc - (lbc % 4)) / 4; lbp = (lbc % 4) * 8; lwa[lwc] = (lwa[lwc] | (str.charCodeAt(lbc) << lbp)); lbc++; }
    lwc = (lbc - (lbc % 4)) / 4; lbp = (lbc % 4) * 8;
    lwa[lwc] = lwa[lwc] | (0x80 << lbp); lwa[lnw - 2] = lml << 3; lwa[lnw - 1] = lml >>> 29;
    return lwa;
  }
  function wth(v) {
    var s = "", t = "", b, c;
    for (c = 0; c <= 3; c++) { b = (v >>> (c * 8)) & 255; t = "0" + b.toString(16); s = s + t.substr(t.length - 2, 2); }
    return s;
  }
  function u8(str) {
    str = str.replace(/\r\n/g, "\n"); var u = "";
    for (var n = 0; n < str.length; n++) {
      var c = str.charCodeAt(n);
      if (c < 128) { u += String.fromCharCode(c); }
      else if ((c > 127) && (c < 2048)) { u += String.fromCharCode((c >> 6) | 192); u += String.fromCharCode((c & 63) | 128); }
      else { u += String.fromCharCode((c >> 12) | 224); u += String.fromCharCode(((c >> 6) & 63) | 128); u += String.fromCharCode((c & 63) | 128); }
    }
    return u;
  }
  var x = [], k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22, S21 = 5, S22 = 9, S23 = 14, S24 = 20,
      S31 = 4, S32 = 11, S33 = 16, S34 = 23, S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  string = u8(string); x = cwa(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340); c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453); c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681); c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97); c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = au(a, AA); b = au(b, BB); c = au(c, CC); d = au(d, DD);
  }
  return (wth(a) + wth(b) + wth(c) + wth(d)).toLowerCase();
}

async function hmacSha256Hex(keyStr, msgStr) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(keyStr), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msgStr));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function makeSign(token, path, body, ts) {
  const hj = `{"platform":"${PLATFORM}","timestamp":"${ts}","dId":"","vName":"${VNAME}"}`;
  return md5(await hmacSha256Hex(token, path + body + ts + hj));
}

function nowTs() { return String(Math.floor(Date.now() / 1000)); }

function buildHeaders(cred, ts, sign, role) {
  const h = {
    "accept": "*/*",
    "content-type": "application/json",
    "cred": cred,
    "platform": PLATFORM,
    "sk-language": SK_LANG,
    "timestamp": ts,
    "sign": sign,
    "vname": VNAME,
  };
  if (role) h["sk-game-role"] = role;
  return h;
}

async function signedFetch(method, path, cred, token, role) {
  const ts = nowTs();
  const sign = await makeSign(token, path, "", ts);
  const res = await fetch(ZONAI + path, {
    method,
    headers: buildHeaders(cred, ts, sign, role),
    body: method === "POST" ? "" : undefined,
  });
  try { return await res.json(); }
  catch (e) { return { code: -1 }; }
}

function readCreds() {
  return { cred: localStorage.getItem(CRED_KEY), token: localStorage.getItem(TOKEN_KEY) };
}

async function waitForCreds(timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const c = readCreds();
    if (c.cred && c.token) return c;
    await sleep(500);
  }
  return readCreds();
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

async function run() {
  await sleep(INITIAL_DELAY);
  const { cred, token } = await waitForCreds(CREDS_TIMEOUT);
  if (!cred || !token) return false;

  const binding = await signedFetch("GET", BINDING_PATH, cred, token, null);
  if (binding.code !== 0) return false;
  const role = extractRole(binding);
  if (!role) return false;

  // POST is idempotent: claiming twice just returns 'already claimed'.
  const claim = await signedFetch("POST", ATTENDANCE_PATH, cred, token, role);
  if (claim.code === 0) return true;
  const after = await signedFetch("GET", ATTENDANCE_PATH, cred, token, role);
  return after?.data?.hasToday === true;
}

(async function main() {
  let resp;
  try { resp = await chrome.runtime.sendMessage({ type: "hello" }); }
  catch (e) { return; }
  if (!resp || !resp.shouldRun) return;

  let ok = false;
  try { ok = await run(); } catch (e) { ok = false; }
  try { await chrome.runtime.sendMessage({ type: "result", ok }); } catch (e) {}
})();
