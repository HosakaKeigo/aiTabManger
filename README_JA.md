# AI Tab Manager

AI Tab Manager は、Google の Gemini AI を活用して自然言語でタブを検索・切り替えができる Chrome 拡張機能です。

## 特徴

- 自然言語でのタブ検索
- キーボードショートカットによる素早いタブ切り替え（Ctrl+Shift+X）
- AI による高精度なタブマッチング
- シンプルで直感的なインターフェース

## インストール方法

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/aiTabManager.git
cd aiTabManager
```

2. 依存パッケージのインストール
```bash
npm install
```

3. ビルド
```bash
npm run build
```

4. Chrome への拡張機能の読み込み
- Chrome で `chrome://extensions/` を開く
- 「デベロッパーモード」を有効化
- 「パッケージ化されていない拡張機能を読み込む」をクリック
- プロジェクトの `dist` ディレクトリを選択

## 設定

1. [Google AI Studio](https://makersuite.google.com/app/apikey) で Gemini API キーを取得
2. 拡張機能の設定アイコンをクリック（拡張機能アイコンを右クリック > オプション）
3. Gemini API キーを入力
4. 設定を保存

## 使い方

1. 拡張機能のアイコンをクリックするか、`Ctrl+Shift+X`（Windows/Linux）または`Cmd+Shift+X`（Mac）を押す
2. 自然言語でクエリを入力（例：「GitHub のタブを探して」や「ドキュメントのページに切り替えて」）
3. Enter キーを押すか検索ボタンをクリック
4. 最も関連性の高いタブに自動的に切り替わります

## 開発

### プロジェクト構成
```
src/
├── background/     # バックグラウンドサービスワーカー
├── popup/         # ポップアップUIとメインロジック
├── options/       # 設定ページ
├── services/      # APIとタブ管理サービス
├── types/         # TypeScript型定義
└── utils/         # ヘルパーユーティリティ
```

### 開発用コマンド
- `npm run dev`: 開発モードの起動（ホットリロード対応）
- `npm run build`: プロダクションビルド
- `npm run preview`: プロダクションビルドのプレビュー

## 技術スタック

- TypeScript
- Vite
- CRXJS（Chrome拡張機能開発）
- Google Gemini AI API
