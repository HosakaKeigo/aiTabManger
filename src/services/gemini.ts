import { BookmarkInfo } from './bookmark';

interface SearchResponse {
  selectedTab?: {
    tab_id: number;
  } | null;
  selectedBookmark?: {
    url: string;
  } | null;
}

export class GeminiService {
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  constructor(private readonly apiKey: string) { }

  async findContent(query: string, tabs: chrome.tabs.Tab[], bookmarks: BookmarkInfo[]): Promise<SearchResponse> {
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{
          text: this.buildPrompt(query, tabs, bookmarks)
        }]
      }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            selectedTab: {
              type: "object",
              properties: {
                tab_id: { type: "number", nullable: true }
              }
            },
            selectedBookmark: {
              type: "object",
              properties: {
                url: { type: "string", nullable: true }
              }
            }
          },
          required: ["selectedTab", "selectedBookmark"]
        }
      }
    };

    const response = await fetch(
      `${this.apiUrl}?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`APIリクエストに失敗しました: ${response.statusText}`);
    }

    const apiResult = await response.json();
    const candidateText = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('APIレスポンスの形式が不正です');
    }

    try {
      return JSON.parse(candidateText.trim());
    } catch (e) {
      console.error('JSON Parse Error:', e);
      throw new Error('APIレスポンスのパースに失敗しました');
    }
  }

  private buildPrompt(query: string, tabs: chrome.tabs.Tab[], bookmarks: BookmarkInfo[]): string {
    return `ユーザーの検索キーワード「${query}」に最も関連性の高いタブまたはブックマークを選んでください。

現在開いているタブのリスト:
${JSON.stringify(tabs.map(t => ({ id: t.id, title: t.title, url: t.url })), null, 2)}

ブックマークのリスト:
${JSON.stringify(bookmarks, null, 2)}

以下の形式でJSONを返してください:

タブが見つかった場合:
{
  "selectedTab": {
    "tab_id": [タブのID]
  },
  "selectedBookmark": null
}

タブが見つからず、ブックマークが見つかった場合:
{
  "selectedTab": null,
  "selectedBookmark": {
    "url": "[ブックマークのURL]"
  }
}

何も見つからなかった場合:
{
  "selectedTab": null,
  "selectedBookmark": null
}`;
  }
}