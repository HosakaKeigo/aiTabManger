// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log("Tab Switcher extension installed.");
});

// タブが更新された時のイベントリスナー
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 必要に応じて処理を追加
});