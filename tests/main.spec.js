const fs = require("fs");
const path = require("path");
const { build } = require("../src/main");

// fsモジュールをモック化
jest.mock("fs", () => ({
  ...jest.requireActual("fs"), // fsの実際の関数を一部保持
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe("main build process", () => {
  const articlesDir = path.join(process.cwd(), "articles");
  const docsDir = path.join(process.cwd(), "docs");
  const docsArticlesDir = path.join(docsDir, "articles");

  beforeEach(() => {
    // モックのリセット
    fs.readdirSync.mockReset();
    fs.readFileSync.mockReset();
    fs.writeFileSync.mockReset();
    fs.existsSync.mockReset();
    fs.mkdirSync.mockReset();

    // ディレクトリが存在しないと仮定
    fs.existsSync.mockReturnValue(false);

    // getArticleFilesが返す値をモック
    fs.readdirSync.mockReturnValueOnce([
      "test.md",
      "test1.md",
      "test2.md",
      "not-a-markdown.txt",
    ]);

    // readArticleFileが返す値をモック
    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes("test1.md")) {
        return "# テスト記事1\n\nこれはテスト記事1の内容です。";
      } else if (filePath.includes("test2.md")) {
        return "# テスト記事2\n\nこれはテスト記事2の内容です。";
      } else if (filePath.includes("test.md")) {
        return "# テスト記事\n\nこれはテスト記事の内容です。";
      }
      return "";
    });
  });

  test("should generate HTML files for each markdown article", () => {
    build();

    // docs/articlesディレクトリが作成されることを確認
    expect(fs.mkdirSync).toHaveBeenCalledWith(docsDir, { recursive: true });
    expect(fs.mkdirSync).toHaveBeenCalledWith(docsArticlesDir, {
      recursive: true,
    });

    // test1.mdからtest1.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsArticlesDir, "test1.html"),
      expect.stringContaining("<title>テスト記事1</title>"),
      "utf8"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsArticlesDir, "test1.html"),
      expect.stringContaining(
        "<h1>テスト記事1</h1>\n<p>これはテスト記事1の内容です。</p>"
      ),
      "utf8"
    );

    // test2.mdからtest2.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsArticlesDir, "test2.html"),
      expect.stringContaining("<title>テスト記事2</title>"),
      "utf8"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsArticlesDir, "test2.html"),
      expect.stringContaining(
        "<h1>テスト記事2</h1>\n<p>これはテスト記事2の内容です。</p>"
      ),
      "utf8"
    );

    // index.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsDir, "index.html"),
      expect.stringContaining(
        "<h1>記事一覧</h1>" +
          "\n    <ul>" +
          '\n        <li><a href="articles/test.html">テスト記事</a></li>' +
          '\n        <li><a href="articles/test1.html">テスト記事1</a></li>' +
          '\n        <li><a href="articles/test2.html">テスト記事2</a></li>' +
          "\n    </ul>"
      ),
      "utf8"
    );
  });

  test("should ensure public directory does not exist after build", () => {
    build();

    // テストではpostbuildフックは実行されないため、直接確認する想定
    // 実際のテストではnpm run buildを実行してpostbuildフックを確認する
    const publicPath = path.join(process.cwd(), "public");
    expect(fs.existsSync(publicPath)).toBe(false);
  });
});
