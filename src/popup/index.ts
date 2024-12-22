import { UIElements, SearchResult } from '../types';
import { GeminiService } from '../services/gemini';
import { TabService } from '../services/tab';
import { BookmarkService } from '../services/bookmark';
import { UIHelper } from '../utils/ui-helper';

document.addEventListener("DOMContentLoaded", () => {
  const elements: UIElements = {
    searchBtn: document.getElementById("searchBtn") as HTMLButtonElement,
    queryInput: document.getElementById("query") as HTMLInputElement,
    loadingElement: document.getElementById("loading") as HTMLDivElement,
    errorMessage: document.getElementById("errorMessage") as HTMLDivElement,
    resultsList: document.getElementById("resultsList") as HTMLDivElement
  };

  const uiHelper = new UIHelper(elements);
  const tabService = new TabService();
  const bookmarkService = new BookmarkService();

  elements.queryInput.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      void searchContent();
    }
  });

  elements.queryInput.addEventListener("input", () => {
    uiHelper.clearError();
    uiHelper.hideResults();
  });

  elements.searchBtn.addEventListener("click", () => void searchContent());
  elements.queryInput.focus();

  async function handleResultSelect(result: SearchResult): Promise<void> {
    try {
      if (result.type === 'tab') {
        const tabId = typeof result.id === 'string' ? parseInt(result.id, 10) : result.id;
        const tab = await chrome.tabs.get(tabId);
        if (tab && tab.id) {
          await tabService.switchToTab(tab.id, tab.windowId);
          console.log('Tab switched');
          window.close();
        }
      } else {
        const newTab = await bookmarkService.openBookmarkInNewTab(result.url);
        if (newTab) {
          console.log('Bookmark opened in new tab');
          window.close();
        }
      }
    } catch (e) {
      console.error('Error handling result selection:', e);
      uiHelper.showError('選択した項目を開けませんでした');
    }
  }

  async function searchContent(): Promise<void> {
    uiHelper.clearError();
    uiHelper.hideResults();

    try {
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

      // タブとブックマークの情報を取得
      const [tabs, bookmarks] = await Promise.all([
        tabService.getAllTabs(),
        bookmarkService.getAll()
      ]);

      // Gemini APIで検索
      const geminiService = new GeminiService(result.geminiApiKey);
      const searchResult = await geminiService.findContent(query, tabs, bookmarks);

      // 結果が見つかった場合
      if (searchResult.results.length > 0) {
        uiHelper.showResults(searchResult.results, handleResultSelect);
      } else {
        uiHelper.showError(`「${query}」に関連するタブやブックマークが見つかりませんでした`);
      }

    } catch (e) {
      console.error('Error:', e);
      uiHelper.showError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      uiHelper.hideLoading();
    }
  }
});