import { SearchResult, ParsedResponse } from '../types';
import { BookmarkInfo } from './bookmark';

export class GeminiService {
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  constructor(private readonly apiKey: string) { }

  async findContent(query: string, tabs: chrome.tabs.Tab[], bookmarks: BookmarkInfo[]): Promise<ParsedResponse> {
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{
          text: this.buildPrompt(query, tabs, bookmarks)
        }]
      }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["tab", "bookmark"] },
                  id: { type: "number" },
                  title: { type: "string" },
                  url: { type: "string" },
                  score: { type: "number" }
                },
                required: ["type", "id", "title", "url", "score"]
              }
            }
          },
          required: ["results"]
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
      const parsedResponse = JSON.parse(candidateText.trim());
      return {
        results: this.sortResults(parsedResponse.results)
      };
    } catch (e) {
      console.error('JSON Parse Error:', e);
      throw new Error('APIレスポンスのパースに失敗しました');
    }
  }

  private buildPrompt(query: string, tabs: chrome.tabs.Tab[], bookmarks: BookmarkInfo[]): string {
    return `ユーザーの検索キーワード「${query}」に関連するタブとブックマークを探してください。
関連度が高い順に最大3件まで候補を返してください。
それぞれの候補について、関連度を0-100のスコアで示し、選んだ理由も付けてください。

現在開いているタブのリスト:
${JSON.stringify(tabs, null, 2)}

ブックマークのリスト:
${JSON.stringify(bookmarks, null, 2)}

以下の形式でJSONを返してください:
{
  "results": [
    {
      "type": "tab" または "bookmark",
      "id": タブIDまたはブックマークID,
      "title": "タイトル",
      "url": "URL", // typeがtabの場合は空文字列
      "score": 0-100の関連度スコア,
    },
    ...
  ]
}`;
  }

  private sortResults(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => b.score - a.score);
  }
}