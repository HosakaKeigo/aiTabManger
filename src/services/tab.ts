import { TabInfo } from '../types';

export class TabService {
  async getAllTabs(): Promise<TabInfo[]> {
    const tabs = await chrome.tabs.query({});
    return tabs.map(tab => ({
      id: tab.id ?? -1,
      title: tab.title || "",
      url: tab.url || ""
    }));
  }

  async switchToTab(tabId: number, windowId?: number): Promise<void> {
    await chrome.tabs.update(tabId, { active: true });
    if (windowId) {
      await chrome.windows.update(windowId, { focused: true });
    }
  }

  async findTabById(tabs: chrome.tabs.Tab[], tabId: number): Promise<chrome.tabs.Tab | undefined> {
    return tabs.find(t => t.id === tabId);
  }
}