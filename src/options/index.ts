document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
  const saveButton = document.getElementById('save') as HTMLButtonElement;
  const status = document.getElementById('status') as HTMLDivElement;

  // 保存されているAPIキーを読み込んで表示
  chrome.storage.sync.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      apiKeyInput.value = result.geminiApiKey;
    }
  });

  function showStatus(message: string, type: 'success' | 'error'): void {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';

    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  }

  // 保存ボタンのイベントハンドラ
  saveButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('Please enter an API key.', 'error');
      return;
    }

    // APIキーを保存
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      showStatus('Settings saved successfully!', 'success');
    });
  });
});