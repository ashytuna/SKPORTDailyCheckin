'use strict';

import { claimDaily } from './skport.js';

const ALARM = "skport-daily";

// A small grace delay before the first claim attempt on startup.
const TIMEOUT = 1910;

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

async function alreadyDoneToday() {
  const { lastSuccessDate } = await chrome.storage.local.get({ lastSuccessDate: "" });
  return lastSuccessDate === todayStr();
}

async function setBadge(ok) {
  try {
    await chrome.action.setBadgeText({ text: ok ? "✓" : "✗" });
    await chrome.action.setBadgeBackgroundColor({ color: ok ? "#2e7d32" : "#c62828" });
  } catch (e) {}
}

async function tryClaim() {
  if (await alreadyDoneToday()) return;

  let ok = false;
  try { ok = await claimDaily(); }
  catch (e) { console.warn("[SKPORT] check-in failed:", e.message); }

  await setBadge(ok);
  if (ok) {
    console.log("[SKPORT] checked in");
    await chrome.storage.local.set({ lastSuccessDate: todayStr() });
  }
}

chrome.runtime.onStartup.addListener(() => {
  setTimeout(tryClaim, TIMEOUT);
});

chrome.runtime.onInstalled.addListener(() => {
  // Re-arm in case the browser stays open all day across midnight.
  chrome.alarms.create(ALARM, { periodInMinutes: 360 });
  setTimeout(tryClaim, TIMEOUT);
});

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === ALARM) tryClaim();
});
