import { TabInfo, GeminiResponse, ParsedResponse } from '../types';

export class GeminiService {
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  constructor(private readonly apiKey: string) { }

  async findRelevantTab(query: string, tabs: TabInfo[]): Promise<ParsedResponse> {
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{
          text: this.buildPrompt(query, tabs)
        }]
      }],
      generationConfig: {
        temperature: 0,
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
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error('APIリクエストが失敗しました');
    }

    const apiResult = await response.json() as GeminiResponse;
    const candidateText = apiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('APIレスポンスの形式が不正です');
    }

    try {
      return JSON.parse(candidateText.trim());
    } catch (e) {
      console.error('JSON Parse Error:', e);
      console.error('Raw Text:', candidateText);
      throw new Error('APIレスポンスのパースに失敗しました');
    }
  }

  private buildPrompt(query: string, tabs: TabInfo[]): string {
    return `ユーザーの検索キーワード「${query}」に最も関連性の高いタブを選んでください。

現在開いているタブのリスト:
${JSON.stringify(tabs, null, 2)}

以下の形式でJSONを返してください:

{
  "selected_tab": {
    "tab_id": [タブのID],
  }
}`;
  }
}