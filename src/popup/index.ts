import { UIElements } from '../types';
import { GeminiService } from '../services/gemini';
import { TabService } from '../services/tab';
import { BookmarkService } from '../services/bookmark';
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
  const bookmarkService = new BookmarkService();

  elements.queryInput.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      void searchContent();
    }
  });

  elements.queryInput.addEventListener("input", () => uiHelper.clearError());
  elements.searchBtn.addEventListener("click", () => void searchContent());

  async function searchContent(): Promise<void> {
    uiHelper.clearError();

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

      // タブが見つかった場合
      if (searchResult.selectedTab) {
        const tab = await tabService.findTabById(tabs, searchResult.selectedTab.tab_id);
        if (tab && tab.id) {
          await tabService.switchToTab(tab.id, tab.windowId);
          console.log('Tab switched');
          window.close();
          return;
        }
      }

      // ブックマークが見つかった場合
      if (searchResult.selectedBookmark?.url) {
        const newTab = await bookmarkService.openBookmarkInNewTab(searchResult.selectedBookmark.url);
        if (newTab) {
          console.log('Bookmark opened in new tab');
          window.close();
          return;
        }
      }

      // 何も見つからなかった場合
      uiHelper.showError(`「${query}」に関連するタブやブックマークが見つかりませんでした`);

    } catch (e) {
      console.error('Error:', e);
      uiHelper.showError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      uiHelper.hideLoading();
    }
  }
});