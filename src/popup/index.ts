interface TabInfo {
  id: number;
  title: string;
  url: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface ParsedResponse {
  selected_tab?: {
    tab_id: number;
  } | null;
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
  const queryInput = document.getElementById("query") as HTMLInputElement;
  const loadingElement = document.getElementById("loading") as HTMLDivElement;
  const errorMessage = document.getElementById("errorMessage") as HTMLDivElement;

  function showError(message: string, showNotification = false): void {
    errorMessage.textContent = message;
    errorMessage.classList.add("active");
    queryInput.classList.add("error");

    if (showNotification) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/icon48.png',
        title: 'AI Tab Manager',
        message: message,
        priority: 1
      });
    }

    setTimeout(() => {
      errorMessage.classList.remove("active");
      queryInput.classList.remove("error");
    }, 3000);
  }

  function clearError(): void {
    errorMessage.classList.remove("active");
    queryInput.classList.remove("error");
  }

  queryInput.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      void searchTabs();
    }
  });

  queryInput.addEventListener("input", clearError);
  searchBtn.addEventListener("click", () => void searchTabs());

  async function searchTabs(): Promise<void> {
    clearError();

    try {
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      if (!result.geminiApiKey) {
        showError('APIキーが設定されていません。設定画面で設定してください。', true);
        void chrome.runtime.openOptionsPage();
        return;
      }

      const query = queryInput.value.trim();
      if (!query) {
        showError('検索キーワードを入力してください');
        return;
      }

      loadingElement.classList.add("active");

      const tabs = await chrome.tabs.query({});
      const tabsInfo: TabInfo[] = tabs.map(tab => ({
        id: tab.id ?? -1,
        title: tab.title || "",
        url: tab.url || ""
      }));

      const requestBody = {
        contents: [{
          role: "user",
          parts: [{
            text: `ユーザーの検索キーワード「${query}」に最も関連性の高いタブを選んでください。

現在開いているタブのリスト:
${JSON.stringify(tabsInfo, null, 2)}

以下の形式でJSONを返してください:

{
  "selected_tab": {
    "tab_id": [タブのID],
  }
}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              selected_tab: {
                type: "object",
                properties: {
                  tab_id: { type: "number" }
                }
              }
            }
          }
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${result.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('APIリクエストが失敗しました');
      }

      const apiResult = await response.json() as GeminiResponse;
      console.log('API Response:', apiResult);

      const candidateText = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('APIレスポンスの形式が不正です');
      }

      let parseResult: ParsedResponse;
      try {
        parseResult = JSON.parse(candidateText.trim());
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.error('Raw Text:', candidateText);
        throw new Error('APIレスポンスのパースに失敗しました');
      }

      if (!parseResult?.selected_tab) {
        showError(`「${query}」に関連するタブが見つかりませんでした`, true);
        return;
      }

      const selectedTab = parseResult.selected_tab;
      const tab = tabs.find(t => t.id === selectedTab.tab_id);

      if (!tab || !tab.id) {
        console.error('Selected tab not found:', selectedTab);
        throw new Error('選択されたタブが見つかりません');
      }

      await chrome.tabs.update(tab.id, { active: true });
      if (tab.windowId) {
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      console.log('Tab switched');
      window.close();

    } catch (e) {
      console.error('Error:', e);
      showError(e instanceof Error ? e.message : 'エラーが発生しました', true);
    } finally {
      loadingElement.classList.remove("active");
    }
  }
});