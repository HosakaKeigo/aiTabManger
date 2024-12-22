import { UIElements, SearchResult } from '../types';

export class UIHelper {
  private selectedIndex: number = -1;

  constructor(private elements: UIElements) { }

  showError(message: string): void {
    const { errorMessage, queryInput } = this.elements;

    errorMessage.textContent = message;
    errorMessage.classList.add("active");
    queryInput.classList.add("error");

    setTimeout(() => {
      errorMessage.classList.remove("active");
      queryInput.classList.remove("error");
    }, 3000);
  }

  clearError(): void {
    const { errorMessage, queryInput } = this.elements;
    errorMessage.classList.remove("active");
    queryInput.classList.remove("error");
  }

  showLoading(): void {
    this.elements.loadingElement.classList.add("active");
  }

  hideLoading(): void {
    this.elements.loadingElement.classList.remove("active");
  }

  getQuery(): string {
    return this.elements.queryInput.value.trim();
  }

  showResults(results: SearchResult[], onSelect: (result: SearchResult) => void): void {
    const { resultsList } = this.elements;
    resultsList.style.display = 'block';
    resultsList.innerHTML = results
      .map((result, index) => `
        <div class="result-item" data-index="${index}">
          <span class="type-badge ${result.type}">
            ${result.type === 'tab' ? 'タブ' : 'ブックマーク'}
          </span>
          <div class="result-content">
            <div class="title">${this.escapeHtml(result.title)}</div>
            <div class="url">${this.escapeHtml(result.url)}</div>
            <div class="score">関連度: ${result.score}</div>
          </div>
        </div>
      `)
      .join('');

    // クリックイベントの設定
    resultsList.querySelectorAll('.result-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.updateSelectedItem();
        onSelect(results[index]);
      });
    });

    // キーボードイベントの設定
    document.addEventListener('keydown', (e) => {
      if (!resultsList.style.display || resultsList.style.display === 'none') return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.selectedIndex = Math.min(this.selectedIndex + 1, results.length - 1);
          this.updateSelectedItem();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
          this.updateSelectedItem();
          break;
        case 'Enter':
          e.preventDefault();
          if (this.selectedIndex >= 0 && this.selectedIndex < results.length) {
            onSelect(results[this.selectedIndex]);
          }
          break;
      }
    });

    // 最初の項目を選択
    if (results.length > 0) {
      this.selectedIndex = 0;
      this.updateSelectedItem();
    }
  }

  hideResults(): void {
    this.elements.resultsList.style.display = 'none';
    this.selectedIndex = -1;
  }

  private updateSelectedItem(): void {
    const items = this.elements.resultsList.querySelectorAll('.result-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}