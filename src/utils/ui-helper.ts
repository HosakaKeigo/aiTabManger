import { UIElements } from '../types';

export class UIHelper {
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
}