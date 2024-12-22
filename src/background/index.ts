chrome.runtime.onInstalled.addListener(() => {
  console.log("Tab Switcher extension installed.");
});

// タブが更新された時のイベントリスナー
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
  // 必要に応じて処理を追加
});