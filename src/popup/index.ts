import { UIElements } from '../types';
import { GeminiService } from '../services/gemini';
import { TabService } from '../services/tab';
import { UIHelper } from '../utils/ui-helper';

document.addEventListener("DOMContentLoaded", () => {
  const elements: UIElements = {
    searchBtn: document.getElementById("searchBtn") as HTMLButtonElement,
    queryInput: document.getElementById("query") as HTMLInputElement,
    loadingElement: document.getElementById("loading") as HTMLDivElement,
    errorMessage: document.getElementById("errorMessage") as HTMLDivElement
  };

  const uiHelper = new UIHelper(elements);
  const tabService = new TabService();

  // イベントリスナーの設定
  elements.queryInput.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      void searchTabs();
    }
  });

  elements.queryInput.addEventListener("input", () => uiHelper.clearError());
  elements.searchBtn.addEventListener("click", () => void searchTabs());

  async function searchTabs(): Promise<void> {
    uiHelper.clearError();

    try {
      // APIキーの取得と検証
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      if (!result.geminiApiKey) {
        uiHelper.showError('APIキーが設定されていません。設定画面で設定してください。');
        void chrome.runtime.openOptionsPage();
        return;
      }

      const query = uiHelper.getQuery();
      if (!query) {
        uiHelper.showError('検索キーワードを入力してください');
        return;
      }

      uiHelper.showLoading();

      // タブ情報の取得
      const tabs = await chrome.tabs.query({});
      const tabsInfo = await tabService.getAllTabs();

      // Gemini APIで関連タブを検索
      const geminiService = new GeminiService(result.geminiApiKey);
      const parseResult = await geminiService.findRelevantTab(query, tabsInfo);

      // タブが見つからなかった場合
      if (!parseResult?.selected_tab) {
        uiHelper.showError(`「${query}」に関連するタブが見つかりませんでした`);
        return;
      }

      // タブの存在確認と切り替え
      const selectedTab = parseResult.selected_tab;
      const tab = await tabService.findTabById(tabs, selectedTab.tab_id);

      if (!tab || !tab.id) {
        console.error('Selected tab not found:', selectedTab);
        throw new Error('選択されたタブが見つかりません');
      }

      await tabService.switchToTab(tab.id, tab.windowId);
      console.log('Tab switched');
      window.close();

    } catch (e) {
      console.error('Error:', e);
      uiHelper.showError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      uiHelper.hideLoading();
    }
  }
});