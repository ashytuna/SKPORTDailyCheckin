'use strict';

const SIGNIN_URL = "https://game.skport.com/endfield/sign-in?header=0&hg_media=skport&hg_link_campaign=tools";
const ALARM = "skport-daily";
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

async function openCheckinTab() {
  if (await alreadyDoneToday()) return;
  try {
    const tab = await chrome.tabs.create({ url: SIGNIN_URL, active: false });
    await chrome.storage.session.set({ openedTabId: tab.id });
  } catch (e) {}
}

chrome.runtime.onStartup.addListener(() => {
  setTimeout(openCheckinTab, TIMEOUT);
});

chrome.runtime.onInstalled.addListener(() => {
  // Re-arm in case the browser stays open all day across midnight.
  chrome.alarms.create(ALARM, { periodInMinutes: 360 });
  setTimeout(openCheckinTab, TIMEOUT);
});

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === ALARM) openCheckinTab();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg?.type === "hello") {
      sendResponse({ shouldRun: !(await alreadyDoneToday()) });
      return;
    }
    if (msg?.type === "result") {
      await setBadge(msg.ok);
      if (msg.ok) {
        await chrome.storage.local.set({ lastSuccessDate: todayStr() });
        const { openedTabId } = await chrome.storage.session.get({ openedTabId: null });
        if (sender.tab && sender.tab.id === openedTabId) {
          try { await chrome.tabs.remove(sender.tab.id); } catch (e) {}
          await chrome.storage.session.remove("openedTabId");
        }
      }
      sendResponse({ ack: true });
      return;
    }
    sendResponse({});
  })();
  return true;
});
