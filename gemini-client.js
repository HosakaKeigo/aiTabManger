// gemini-client.js
const GeminiClient = {
  API_KEY: 'YOUR_GEMINI_API_KEY',

  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        selected_tab: {
          type: "object",
          properties: {
            tab_id: { type: "number" },
            score: { type: "number" },
            reason: { type: "string" }
          }
        }
      }
    }
  },

  async findBestTab(query, tabs) {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      };

      const tabsInfo = tabs.map(tab => ({
        id: tab.id,
        title: tab.title || "",
        url: tab.url || ""
      }));

      const prompt = `
        ユーザーのクエリ: "${query}"
        
        以下のタブリストから、ユーザーのクエリに最も関連性の高いタブを選択してください：
        ${JSON.stringify(tabsInfo, null, 2)}
        
        タブの選択基準:
        1. タイトルとURLの意味的な関連性
        2. キーワードの部分一致
        3. 文脈的な類似性
        
        選択したタブについて、JSONフォーマットで返してください。
      `;

      const body = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: this.generationConfig
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }
};