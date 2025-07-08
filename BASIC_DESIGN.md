    ### 基本設計書：静的サイトジェネレーター

    #### 1. 設計概要
    本システムは、Node.js製のビルドスクリプトであり、要件定義書で定められた通り、マークダウンファイル群から静的なHTMLサイトを生成する。
    TDD（テスト駆動開発）で実装を進めるため、各機能は独立してテスト可能なモジュールとして設計する。

    #### 2. ファイル・ディレクトリ構成
    プロジェクトの全体像を明確にするため、以下の構成とする。

    ```
    application_site/
    ├── .gitignore          # Gitの追跡から除外するファイルを設定
    ├── node_modules/       # npmでインストールされたライブラリ
    ├── articles/           # ユーザーが記事のマークダウンファイルを追加する場所
    │   └── sample.md
    ├── public/             # 生成された静的サイトが格納される場所（この中身をデプロイ）
    │   ├── index.html
    │   └── articles/
    │       └── sample.html
    ├── src/                # ビルドスクリプトのソースコード
    │   ├── main.js         # ビルド処理全体を統括するエントリーポイント
    │   └── file-utils.js   # ファイル読み書き等の共通処理モジュール
    ├── tests/              # Jestのテストコード
    │   └── file-utils.spec.js
    ├── package.json        # プロジェクト情報と依存ライブラリを管理
    └── REQUIREMENTS.md     # 要件定義書
    ```

    #### 3. モジュール設計
    ビルド処理を構成する主要なモジュールと、その責務を以下のように設計する。

    **3.1. `file-utils.js`**
    *   **責務:** ファイルシステムの操作に関する、再利用可能な関数を提供する。
    *   **主要な関数:**
        *   `getArticleFiles()`: `articles`ディレクトリから、すべての`.md`ファイルのパス一覧を取得する。
        *   `readArticleFile(filePath)`: 指定されたパスのマークダウンファイルを読み込み、その内容（文字列）とファイル名（拡張子なし）をオブジェクトとして返す。
        *   `writeHtmlFile(outputPath, content)`: 指定されたパスにHTMLコンテンツを書き出す。
        *   `createOutputDirs()`: `public`および`public/articles`ディレクトリが存在しない場合に作成する。

    **3.2. `main.js`**
    *   **責務:** `file-utils.js`の関数を呼び出し、サイト全体のビルド処理を実行する。
    *   **処理フロー:**
        1.  `createOutputDirs()`を呼び出し、出力先ディレクトリを準備する。
        2.  `getArticleFiles()`を呼び出し、すべての記事ファイルパスを取得する。
        3.  取得した各ファイルパスに対して、以下の処理をループで実行する。
            a. `readArticleFile()`で記事の内容とファイル名を取得する。
            b. 取得したマークダウン内容を`marked`ライブラリでHTMLに変換する。
            c. 変換したHTMLをテンプレートに埋め込み、記事詳細ページの完全なHTMLを生成する。
            d. `writeHtmlFile()`で`public/articles/`以下にHTMLファイルとして保存する。
        4.  すべての記事のファイル名（＝HTMLへのリンク）をリスト化し、トップページ（`index.html`）のHTMLを生成する。
        5.  `writeHtmlFile()`で`public/index.html`を保存する。

    #### 4. HTMLテンプレート設計
    *   **記事詳細ページ (`article.html`のテンプレート):**
        ```html
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <title><!-- 記事タイトル（h1から抽出） --></title>
        </head>
        <body>
            <a href="../index.html">トップへ戻る</a>
            <hr>
            <!-- markedで変換されたHTMLコンテンツがここに挿入される -->
        </body>
        </html>
        ```
    *   **記事一覧ページ (`index.html`のテンプレート):**
        ```html
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <title>記事一覧</title>
        </head>
        <body>
            <h1>記事一覧</h1>
            <ul>
                <!-- 記事へのリンクがここに<li>で挿入される -->
                <!-- 例: <li><a href="articles/sample.html">sample</a></li> -->
            </ul>
        </body>
        </html>
        ```
        *補足: 記事タイトルは、マークダウンの最初のh1要素から取得することを想定する。*

    #### 5. TDDのテスト対象
    *   **`file-utils.spec.js`:**
        *   `getArticleFiles()`が、`articles`ディレクトリ内の`.md`ファイルだけを正しくリストアップできるか。
        *   `readArticleFile()`が、ファイル内容と適切なファイル名を返せるか。
        *   （`writeHtmlFile`と`createOutputDirs`は副作用を持つため、`fs`モジュールをモック化してテストする）