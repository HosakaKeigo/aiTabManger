export class TabService {
  async getAllTabs(): Promise<chrome.tabs.Tab[]> {
    const tabs = await chrome.tabs.query({});
    return tabs
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