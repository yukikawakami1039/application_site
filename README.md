# 静的サイトジェネレーター

このプロジェクトは、マークダウンファイルから静的な HTML サイトを生成するシンプルな静的サイトジェネレーターです。

## 使い方

### 1. 記事の作成

`articles/` ディレクトリにマークダウンファイル（例: `my-first-article.md`）を作成します。

```markdown
# 私の最初の記事

これは私の最初の記事の本文です。
```

### 2. ゲーム記事の追加方法

`games/` ディレクトリにマークダウンファイル（例: `new-game-review.md`）を作成します。

```markdown
# 【新作ゲーム】Example Game - 究極の冒険体験

> **本記事にはアフィリエイト広告が含まれます**

## ゲーム概要
- **リリース**: 2025年7月
- **ジャンル**: アクションRPG
- **開発/運営**: Example Studios
- **レーティング**: CERO A（全年齢対象）

## 特徴
ここにゲームの特徴や魅力を記載...

## ダウンロードリンク
- [iOS版をダウンロード](https://example.com/ios)
- [Android版をダウンロード](https://example.com/android)
```

**ゲーム記事のフロントマター例（推奨）:**
- タイトルは `#` で始まる見出しとして記載
- ジャンル、リリース情報、レーティングを明記
- アフィリエイト開示文を記事冒頭に配置
- ダウンロードリンクやアフィリエイトリンクを含める

ゲーム記事は `docs/games/` ディレクトリに HTML として生成され、メインページのゲーム一覧セクションと専用のゲーム一覧ページ（`docs/games/index.html`）に自動的に追加されます。

### 3. ビルド手順

以下のコマンドを実行すると、`docs/` ディレクトリに静的な HTML ファイルが生成されます。

```bash
npm run build
```

このコマンドにより、以下のファイルが生成されます：
- **記事ページ**: `articles/*.md` → `docs/articles/*.html`
- **ゲームページ**: `games/*.md` → `docs/games/*.html`
- **メインページ**: `docs/index.html`（記事とゲームの両方の一覧を表示）
- **ゲーム一覧ページ**: `docs/games/index.html`
- **アセット**: `assets/*` → `docs/css/`, `docs/js/` に自動コピー

### 4. 開発用サーバ

ローカルで作成したサイトを確認するには、以下のコマンドを実行してください：

```bash
npx serve docs
```

ブラウザで http://localhost:3000 にアクセスして、生成されたサイトを確認できます。

### ページビュー計測（Cloudflare Web Analytics）

このプロジェクトは Cloudflare Web Analytics を利用してページビューを計測しています。

1. Cloudflare ダッシュボードでサイトを追加し **Site ID（token）** を取得
2. `src/main.js` 内の `"YOUR_SITE_ID"` を実際の token に置換
3. `npm run build` → `git push` 後、ダッシュボードの **Web Analytics > Overview** で PV を確認

## 機能

- マークダウンから HTML への変換
- 記事一覧の自動生成（`articles/` フォルダから）
- ゲーム記事一覧の自動生成（`games/` フォルダから）
- レスポンシブデザイン
- CSS および JavaScript ファイルの自動コピー
- Cloudflare Web Analytics 統合

### 5. サイトの確認

`docs/` ディレクトリの中身を Web サーバー（例: Live Server, Nginx, Apache など）でホスティングすることで、生成されたサイトをブラウザで確認できます。

GitHub Pages で公開する場合は、`docs/` ディレクトリの中身を GitHub リポジトリにプッシュし、GitHub Pages の設定を行ってください。

## 開発

### テストの実行

```bash
npm test
```
