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
  rmSync: jest.fn(),
}));

describe("games build process", () => {
  const articlesDir = path.join(process.cwd(), "articles");
  const gamesDir = path.join(process.cwd(), "games");
  const docsDir = path.join(process.cwd(), "docs");
  const docsArticlesDir = path.join(docsDir, "articles");
  const docsGamesDir = path.join(docsDir, "games");

  beforeEach(() => {
    // モックのリセット
    fs.readdirSync.mockReset();
    fs.readFileSync.mockReset();
    fs.writeFileSync.mockReset();
    fs.existsSync.mockReset();
    fs.mkdirSync.mockReset();
    fs.rmSync.mockReset();

    // ディレクトリの存在をモック
    fs.existsSync.mockImplementation((dirPath) => {
      // articlesとgamesのソースディレクトリは存在する
      if (dirPath.includes("articles") && !dirPath.includes("docs")) {
        return true;
      }
      if (dirPath.includes("games") && !dirPath.includes("docs")) {
        return true;
      }
      // docsディレクトリは存在しないため、作成される
      return false;
    });

    // articlesとgamesの両方のディレクトリを読み込むためのモック設定
    fs.readdirSync.mockImplementation((dirPath) => {
      if (dirPath.includes("articles")) {
        return ["test.md", "test1.md", "test2.md", "not-a-markdown.txt"];
      } else if (dirPath.includes("games")) {
        return ["sample.md", "not-a-game.txt"];
      }
      return [];
    });

    // readFileSync のモック設定（articlesとgames両方に対応）
    fs.readFileSync.mockImplementation((filePath) => {
      // articles用のモック
      if (filePath.includes("articles")) {
        if (filePath.includes("test1.md")) {
          return "# テスト記事1\n\nこれはテスト記事1の内容です。";
        } else if (filePath.includes("test2.md")) {
          return "# テスト記事2\n\nこれはテスト記事2の内容です。";
        } else if (filePath.includes("test.md")) {
          return "# テスト記事\n\nこれはテスト記事の内容です。";
        }
      }
      // games用のモック
      else if (filePath.includes("games")) {
        if (filePath.includes("sample.md")) {
          return "# サンプルゲーム\n\nこれはサンプルゲームの説明です。";
        }
      }
      return "";
    });
  });

  test("should generate HTML files for each markdown game and create games index", () => {
    build();

    // docs/gamesディレクトリが作成されることを確認
    expect(fs.mkdirSync).toHaveBeenCalledWith(docsGamesDir, {
      recursive: true,
    });

    // sample.mdからsample.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsGamesDir, "sample.html"),
      expect.stringContaining("<title>サンプルゲーム | LensReview</title>"),
      "utf8"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsGamesDir, "sample.html"),
      expect.stringContaining(
        "<h1>サンプルゲーム</h1>\n<p>これはサンプルゲームの説明です。</p>"
      ),
      "utf8"
    );

    // docs/games/index.htmlが生成されることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsGamesDir, "index.html"),
      expect.stringContaining("<title>ゲーム一覧 - LensReview</title>"),
      "utf8"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsGamesDir, "index.html"),
      expect.stringContaining('href="sample.html"'),
      "utf8"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsGamesDir, "index.html"),
      expect.stringContaining("サンプルゲーム"),
      "utf8"
    );

    // docs/index.htmlにゲーム一覧へのリンクが追加されていることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsDir, "index.html"),
      expect.stringContaining('href="games/"'),
      "utf8"
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsDir, "index.html"),
      expect.stringContaining("ゲーム一覧"),
      "utf8"
    );
  });

  test("should not break existing article generation when games are added", () => {
    build();

    // 既存の記事生成が正常に動作することを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsArticlesDir, "test1.html"),
      expect.stringContaining("<title>テスト記事1 | LensReview</title>"),
      "utf8"
    );

    // index.htmlに記事一覧も含まれていることを確認
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsDir, "index.html"),
      expect.stringContaining('href="articles/test1.html"'),
      "utf8"
    );
  });

  test("should handle empty games directory gracefully", () => {
    // 空のゲームディレクトリをモック
    fs.readdirSync.mockImplementation((dirPath) => {
      if (dirPath.includes("articles")) {
        return ["test.md"];
      } else if (dirPath.includes("games")) {
        return []; // 空のディレクトリ
      }
      return [];
    });

    fs.readFileSync.mockImplementation((filePath) => {
      if (filePath.includes("test.md")) {
        return "# テスト記事\n\nこれはテスト記事の内容です。";
      }
      return "";
    });

    expect(() => build()).not.toThrow();

    // docs/games/index.htmlは生成されるが、空のゲーム一覧になる
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join(docsGamesDir, "index.html"),
      expect.stringContaining("ゲーム一覧"),
      "utf8"
    );
  });
});
