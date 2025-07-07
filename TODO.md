# TDD 開発 ToDo リスト

## フェーズ 1: プロジェクトのセットアップ

- [x] `npm init -y` を実行し `package.json` を作成する
- [x] `jest`, `marked` を `devDependencies` としてインストールする (`npm install -D jest marked`)
- [x] `package.json` の `scripts` に `"test": "jest"` を追加する
- [x] 基本設計書に基づいたディレクトリ構成を作成する (`articles`, `public`, `src`, `tests`)

## フェーズ 2: `file-utils.js` のテスト駆動開発

- [x] **テスト `getArticleFiles` (RED):**
  - `tests/file-utils.spec.js` を作成する
  - `articles` ディレクトリに `test1.md`, `test2.md`, `not-a-markdown.txt` を配置する
  - `getArticleFiles` を呼び出すと `['articles/test1.md', 'articles/test2.md']` のような配列が返る、というテストを書く（この時点では `file-utils.js` も `getArticleFiles` も存在しないので失敗する）
- [x] **実装 `getArticleFiles` (GREEN):**
  - `src/file-utils.js` を作成する
  - `fs.readdirSync` と `path.join` を使って、テストが通る最小限の `getArticleFiles` を実装し、エクスポートする
- [x] **リファクタリング `getArticleFiles` (REFACTOR):**

  - コードを読みやすく、効率的なものに改善する（もし改善点があれば）

- [x] **テスト `readArticleFile` (RED):**
  - `articles/test1.md` に `# テストタイトル` という内容を書き込む
  - `readArticleFile('articles/test1.md')` を呼び出すと `{ title: 'テストタイトル', body: '# テストタイトル' }` のようなオブジェクトが返る、というテストを書く
- [x] **実装 `readArticleFile` (GREEN):**
  - `fs.readFileSync` を使ってファイル内容を読み込む
  - マークダウンの最初の h1 要素を正規表現で探し、タイトルとして抽出するロジックを実装する
- [x] **リファクタリング `readArticleFile` (REFACTOR):**
  - 正規表現やコードの可読性を改善する

## フェーズ 3: ビルドスクリプト `main.js` の実装

- [x] **テスト `HTMLファイルの生成` (RED):**
  - `fs` モジュールをモック化する
  - `main.js` のビルド関数を実行すると、`fs.writeFileSync` が正しいパス (`public/articles/test1.html`) と正しい HTML 文字列で呼び出されることを検証するテストを書く
- [x] **実装 `HTMLファイルの生成` (GREEN):**

  - `src/main.js` を作成する
  - `getArticleFiles` と `readArticleFile` を使って記事情報を取得する
  - `marked` を使って本文を HTML に変換する
  - HTML テンプレートにタイトルと本文を埋め込み、ファイルに書き出す処理を実装する

- [x] **テスト `index.htmlの生成` (RED):**
  - `main.js` のビルド関数を実行すると、`fs.writeFileSync` が `public/index.html` というパスで、記事一覧を含む HTML 文字列で呼び出されることを検証するテストを書く
- [x] **実装 `index.htmlの生成` (GREEN):**
  - 記事ファイル名のリストから、`<li><a href="...">...</a></li>` のような HTML 文字列を生成するロジックを追加する
  - トップページの HTML テンプレートに埋め込み、ファイルに書き出す処理を実装する
- [x] **リファクタリング `main.js` (REFACTOR):**
  - 全体の処理の流れを整理し、関数に分割するなどして可読性を高める

## フェーズ 4: 最終化

- [x] `package.json` の `scripts` に `"build": "node src/main.js"` を追加する
- [x] `README.md` に使い方を記述する
- [x] `.gitignore` に `node_modules` と `public` を追加する
