// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const queryInput = document.getElementById("query");
  const loadingElement = document.getElementById("loading");
  const errorMessage = document.getElementById("errorMessage");

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add("active");
    queryInput.classList.add("error");

    setTimeout(() => {
      errorMessage.classList.remove("active");
      queryInput.classList.remove("error");
    }, 3000);
  }

  function clearError() {
    errorMessage.classList.remove("active");
    queryInput.classList.remove("error");
  }

  queryInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchTabs();
    }
  });

  queryInput.addEventListener("input", clearError);
  searchBtn.addEventListener("click", searchTabs);

  async function searchTabs() {
    clearError();

    try {
      // APIキーの取得と検証
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      if (!result.geminiApiKey) {
        showError('APIキーが設定されていません。設定画面で設定してください。');
        chrome.runtime.openOptionsPage();
        return;
      }

      // 検索クエリの検証
      const query = queryInput.value.trim();
      if (!query) {
        showError('検索キーワードを入力してください');
        return;
      }

      loadingElement.classList.add("active");
      
      // タブ情報の取得
      const tabs = await chrome.tabs.query({});
      const tabsInfo = tabs.map(tab => ({
        id: tab.id,
        title: tab.title || "",
        url: tab.url || ""
      }));

      // Gemini APIリクエストの準備
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
}
`
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
                  tab_id: { type: "number", nullable:true },
                }
              }
            }
          }
        }
      };

      // Gemini APIの呼び出し
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
      console.log('API Request:', requestBody);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error('APIリクエストが失敗しました');
      }

      const apiResult = await response.json();
      console.log('API Response:', apiResult);

      // レスポンスの解析
      const candidateText = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('APIレスポンスの形式が不正です');
      }

      // JSONのパース
      let parseResult;
      try {
        parseResult = JSON.parse(candidateText.trim());
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.error('Raw Text:', candidateText);
        throw new Error('APIレスポンスのパースに失敗しました');
      }

      // タブが見つからなかった場合
      if (!parseResult.selected_tab || !parseResult.selected_tab.tab_id) {
        showError(`「${query}」に関連するタブが見つかりませんでした`);
        return;
      }

      // タブの存在確認
      const selectedTab = parseResult.selected_tab;
      const tab = tabs.find(t => t.id === selectedTab.tab_id);
      
      if (!tab) {
        console.error('Selected tab not found:', selectedTab);
        throw new Error('選択されたタブが見つかりません');
      }

      // タブの切り替え
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      console.log('Tab switched');
      window.close();

    } catch (e) {
      console.error('Error:', e);
      showError(e.message || 'エラーが発生しました');
    } finally {
      loadingElement.classList.remove("active");
    }
  }
});