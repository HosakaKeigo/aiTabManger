export interface TabInfo {
  id: number;
  title: string;
  url: string;
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export interface SearchResult {
  type: 'tab' | 'bookmark';
  id: number | string;
  title: string;
  url: string;
  score: number;
  reason: string;
}

export interface ParsedResponse {
  results: SearchResult[];
}

export interface UIElements {
  searchBtn: HTMLButtonElement;
  queryInput: HTMLInputElement;
  loadingElement: HTMLDivElement;
  errorMessage: HTMLDivElement;
  resultsList: HTMLDivElement;
}