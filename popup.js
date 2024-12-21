// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const queryInput = document.getElementById("query");
  const loadingElement = document.getElementById("loading");

  // Enter キーのサポート
  queryInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchTabs();
    }
  });

  searchBtn.addEventListener("click", searchTabs);

  async function searchTabs() {
    try {
      // APIキーを取得
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      if (!result.geminiApiKey) {
        alert('Please set your Gemini API key in the extension options.');
        // オプションページを開く
        chrome.runtime.openOptionsPage();
        return;
      }

      const query = queryInput.value.trim();
      if (!query) return;

      loadingElement.classList.add("active");
      
      // 全てのタブ情報を取得
      const tabs = await chrome.tabs.query({});
      
      // タブ情報を整形
      const tabsInfo = tabs.map(tab => ({
        id: tab.id,
        title: tab.title || "",
        url: tab.url || ""
      }));

      // APIリクエストの準備
      const requestBody = {
        contents: [{
          role: "user",
          parts: [{
            text: `
              ユーザーのクエリ: "${query}"
              
              以下のタブリストから、ユーザーのクエリに最も関連性の高いタブを選択してください：
              ${JSON.stringify(tabsInfo, null, 2)}
              
              タブの選択基準:
              1. タイトルとURLの意味的な関連性
              2. キーワードの部分一致
              3. 文脈的な類似性
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
                  tab_id: { type: "number" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      };

      // Gemini APIを呼び出し
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
        throw new Error(`API request failed with status ${response.status}`);
      }

      const apiResult = await response.json();
      console.log('API Response:', apiResult);

      // レスポンスからJSONを抽出
      const candidateText = apiResult.candidates[0]?.content?.parts[0]?.text;
      if (!candidateText) {
        throw new Error('No valid response from API');
      }

      const selectedTab = JSON.parse(candidateText).selected_tab;
      
      // 選択されたタブに切り替え
      if (selectedTab && selectedTab.tab_id) {
        const tab = tabs.find(t => t.id === selectedTab.tab_id);
        if (tab) {
          await chrome.tabs.update(tab.id, { active: true });
          await chrome.windows.update(tab.windowId, { focused: true });
          console.log('Tab switched. Reason:', selectedTab.reason);
        }
      }

      window.close();
    } catch (e) {
      console.error('Error during tab search:', e);
      alert('An error occurred. Please check the console for details.');
    } finally {
      loadingElement.classList.remove("active");
    }
  }
});