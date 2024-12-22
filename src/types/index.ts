export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export interface ParsedResponse {
  selected_tab?: {
    tab_id: number;
  } | null;
}

export interface UIElements {
  searchBtn: HTMLButtonElement;
  queryInput: HTMLInputElement;
  loadingElement: HTMLDivElement;
  errorMessage: HTMLDivElement;
}