# AI Tab Manager

AI Tab Manager は、Google の Gemini AI を活用して自然言語でタブを検索・切り替えができる Chrome 拡張機能です。

## 特徴

- 自然言語でのタブ検索
- 関連度順の複数結果表示
- ブックマークへのフォールバック機能
- キーボードショートカットとナビゲーション
- シンプルなインターフェース

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

1. `Ctrl+Shift+X`（Windows/Linux）または`Cmd+Shift+X`（Mac）を押す
2. 検索したい内容を入力
3. 矢印キーまたはマウスで検索結果から選択
4. Enterキーで選択したタブに切り替え、またはブックマークを開く

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

### コマンド
- `npm run dev`: 開発モードの起動
- `npm run build`: プロダクションビルド

## 動作要件

- Node.js 16 以上
- npm 7 以上
- Chrome ブラウザ

## ライセンス

MIT License - 詳細は LICENSE ファイルを参照してください