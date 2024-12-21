// options.js
document.addEventListener('DOMContentLoaded', () => {
  // 保存されているAPIキーを読み込んで表示
  chrome.storage.sync.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      document.getElementById('apiKey').value = result.geminiApiKey;
    }
  });

  // 保存ボタンのイベントハンドラ
  document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const status = document.getElementById('status');

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

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}