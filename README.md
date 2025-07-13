# 静的サイトジェネレーター

このプロジェクトは、マークダウンファイルから静的な HTML サイトを生成するシンプルな静的サイトジェネレーターです。

## 使い方

### 1. 記事の作成

`articles/` ディレクトリにマークダウンファイル（例: `my-first-article.md`）を作成します。

```markdown
# 私の最初の記事

これは私の最初の記事の本文です。
```

### 2. サイトのビルド

以下のコマンドを実行すると、`docs/` ディレクトリに静的な HTML ファイルが生成されます。

```bash
npm run build
```

### ページビュー計測（Cloudflare Web Analytics）
このプロジェクトは Cloudflare Web Analytics を利用してページビューを計測しています。  
1. Cloudflare ダッシュボードでサイトを追加し **Site ID（token）** を取得  
2. `src/main.js` 内の `"YOUR_SITE_ID"` を実際の token に置換  
3. `npm run build` → `git push` 後、ダッシュボードの **Web Analytics > Overview** で PV を確認  

### 3. サイトの確認

`docs/` ディレクトリの中身を Web サーバー（例: Live Server, Nginx, Apache など）でホスティングすることで、生成されたサイトをブラウザで確認できます。

GitHub Pages で公開する場合は、`docs/` ディレクトリの中身を GitHub リポジトリにプッシュし、GitHub Pages の設定を行ってください。

## 開発

### テストの実行

```bash
npm test
```
